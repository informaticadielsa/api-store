import models from '../models';
import statusControles from '../mapeos/mapeoControlesMaestrosMultiples';
const { Op } = require("sequelize");
import {  Sequelize } from 'sequelize';
const sequelize = new Sequelize(process.env.POSTGRESQL);

const groupBy = function (miarray, prop) {
    return miarray.reduce(function(groups, item) {
        var val = item[prop];
        groups[val] = groups[val] || { prod_marca: item.prod_marca, car_total: 0};
        groups[val].car_total += item.car_total;
        return groups;
    }, {});
}

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

const sumarDias = function(fecha, dias){
    fecha.setDate(fecha.getDate() + dias);
    return fecha;
}
const { cotizacionEmail } = require('../services/CotizacionEmail');
export default {
    //COTIZACIÓN PROYECTO 
    generateCotizacionProyect: async (req, res, next)  =>{
        try{
            const transformar = await models.CarritoDeCompra.findOne({
                where: {
                    cdc_carrito_de_compra_id: req.body.cdc_carrito_de_compra_id
                },
                include: [
                    {
                        model: models.ProductoCarritoDeCompra
                    }
                ]
            });
            const caducidadProyecto = await models.ControlMaestroMultiple.findOne({
                where: {
                    cmm_nombre: 'TIEMPO_CADUCIDAD_COTIZACION_PROYECTO'
                }
            });
            let diacreacion = new Date();
            let sumaDeDias = await sumarDias(diacreacion, Number(caducidadProyecto.dataValues.cmm_valor));
            if(!!transformar && !!transformar.dataValues.cdc_sn_socio_de_negocio_id){
                //Si trae nombre de proyecto y  cumple como candidato, se ingresa en esta parte para diferenciar que es un proyecto
                if(!!req.body.cot_proyecto_nombre && transformar.dataValues.cdc_project_candidate){
                    if(!!transformar.dataValues.productos_carrito_de_compras){
                        const proyecto = await models.CotizacionProyecto.create({
                            cot_numero_orden: transformar.dataValues.cdc_numero_orden,
                            cot_proyecto_nombre: req.body.cot_proyecto_nombre,
                            cot_cmm_tipo_id: statusControles.TIPO_COTIZACION_PROYECTO.PROYECTO,
                            cot_cmm_estatus_id: statusControles.ESTATUS_COTIZACION_PROYECTO.ACTIVO,
                            cot_sn_socios_negocio_id: transformar.dataValues.cdc_sn_socio_de_negocio_id,
                            cot_usu_usuario_vendedor_id: req.body.cot_usu_usuario_vendedor_id,
                            cot_fecha_vencimiento: sumaDeDias,
                            cot_total_cotizacion: transformar.dataValues.cdc_total_carrito
                        });
                        transformar.dataValues.productos_carrito_de_compras.forEach(async function(productoCarrito, indexProductoCarrito){
                            let jsonTemporal = JSON.stringify(productoCarrito.dataValues.pcdc_mejor_descuento);
                            await models.ProductosCotizacionProyecto.create({
                                pc_cot_cotizacion_id: proyecto.dataValues.cot_cotizacion_id,
                                pc_prod_producto_id: productoCarrito.dataValues.pcdc_prod_producto_id,
                                pc_cantidad_producto: productoCarrito.dataValues.pcdc_producto_cantidad,
                                pc_mejor_descuento: jsonTemporal
                            });
                            if((transformar.dataValues.productos_carrito_de_compras.length -1 ) == indexProductoCarrito){
                                await models.ProductoCarritoDeCompra.destroy({
                                    where: {
                                        pcdc_carrito_de_compra_id: transformar.dataValues.cdc_carrito_de_compra_id
                                    }
                                });
                                await models.CarritoDeCompra.destroy({
                                    where: {
                                        cdc_carrito_de_compra_id: transformar.dataValues.cdc_carrito_de_compra_id
                                    }
                                });
                                const cotizacion_proyecto = await models.CotizacionProyecto.findOne({
                                    where: {
                                        cot_cotizacion_id: proyecto.dataValues.cot_cotizacion_id
                                    },
                                    include: [
                                        {
                                            model: models.ProductosCotizacionProyecto,
                                            include: [
                                                {
                                                    model: models.Producto
                                                }
                                            ]
                                        }
                                    ]
                                })
                                res.status(200).send({
                                    message: 'Proyecto creado exitosamente',
                                    cotizacion_proyecto
                                });
                            }
                        });
                    }else{
                        //Si el carrito esta vacio no se puede procesar.
                        res.status(300).send({
                            message: 'Error al crear proyecto, el carrito se encuentra vació'
                        });
                    }
                }else{
                    //Sino se trae nombre de proyecto, se ingresa en este apartado, para procesarla como cotización
                    if(!!transformar.dataValues.productos_carrito_de_compras){
                        const proyecto = await models.CotizacionProyecto.create({
                            cot_numero_orden: transformar.dataValues.cdc_numero_orden,
                            cot_proyecto_nombre: req.body.cot_proyecto_nombre,
                            cot_cmm_tipo_id: statusControles.TIPO_COTIZACION_PROYECTO.PROYECTO,
                            cot_cmm_estatus_id: statusControles.ESTATUS_COTIZACION_PROYECTO.ACTIVO,
                            cot_sn_socios_negocio_id: transformar.dataValues.cdc_sn_socio_de_negocio_id,
                            cot_usu_usuario_vendedor_id: req.body.cot_usu_usuario_vendedor_id,
                            cot_fecha_vencimiento: sumaDeDias,
                            cot_total_cotizacion: transformar.dataValues.cdc_total_carrito
                        });
                        transformar.dataValues.productos_carrito_de_compras.forEach(async function(productoCarrito, indexProductoCarrito){
                            let jsonTemporal = JSON.stringify(productoCarrito.dataValues.pcdc_mejor_descuento);
                            await models.ProductosCotizacionProyecto.create({
                                pc_cot_cotizacion_id: proyecto.dataValues.cot_cotizacion_id,
                                pc_prod_producto_id: productoCarrito.dataValues.pcdc_prod_producto_id,
                                pc_cantidad_producto: productoCarrito.dataValues.pcdc_producto_cantidad,
                                pc_mejor_descuento: jsonTemporal
                            });
                            if((transformar.dataValues.productos_carrito_de_compras.length -1 ) == indexProductoCarrito){
                                await models.ProductoCarritoDeCompra.destroy({
                                    where: {
                                        pcdc_carrito_de_compra_id: transformar.dataValues.cdc_carrito_de_compra_id
                                    }
                                });
                                await models.CarritoDeCompra.destroy({
                                    where: {
                                        cdc_carrito_de_compra_id: transformar.dataValues.cdc_carrito_de_compra_id
                                    }
                                });
                                const cotizacion_proyecto = await models.CotizacionProyecto.findOne({
                                    where: {
                                        cot_cotizacion_id: proyecto.dataValues.cot_cotizacion_id
                                    },
                                    include: [
                                        {
                                            model: models.ProductosCotizacionProyecto,
                                            include: [
                                                {
                                                    model: models.Producto
                                                }
                                            ]
                                        }
                                    ]
                                })
                                res.status(200).send({
                                    message: 'Cotización creada exitosamente',
                                    cotizacion_proyecto
                                });
                            }
                        });
                    }else{
                        //Si el carrito esta vacio no se puede procesar
                        res.status(300).send({
                            message: 'Error al crear cotización, el carrito se encuentra vació'
                        });
                    }
                }
            }else if(!!transformar && !!!transformar.dataValues.cdc_sn_socio_de_negocio_id){
                //Si el carrito no tiene socio de negocio, no se puede crear aún que cumpla como proyecto
                res.status(300).send({
                    message: 'Error, no se puede crear cotización/proyecto ya que el carrito no ha sido asignado'
                });
            }else{
                //El carrito fue eliminado en el proceso ☹
                res.status(300).send({
                    message: 'Error, el carrito no exite o fue eliminado'
                });
            }
        }catch(e){
            //Aquí todo se rompio y a revisar el codigo ☹
            res.status(200).send({
                message: 'Error, al generar la cotización',
                e
            });
            next(e);
        }
    },
    editUpdateCotizacion: async(req, res, next) =>{
        try{
            const cotizacion_proyecto_update = await models.CotizacionProyecto.findOne({
                where : {
                    cot_cotizacion_id: req.body.cot_cotizacion_id
                },
            });
            if(!!cotizacion_proyecto_update){
                await cotizacion_proyecto_update.update({
                    cot_proyecto_nombre: !!req.body.cot_proyecto_nombre ? req.body.cot_proyecto_nombre : cotizacion_proyecto_update.dataValues.cot_proyecto_nombre,
                    cot_cmm_tipo_id: !!req.body.cot_cmm_tipo_id ? req.body.cot_cmm_tipo_id : cotizacion_proyecto_update.dataValues.cot_cmm_tipo_id,
                    cot_usu_usuario_modificador_id: !!req.body.cot_usu_usuario_modificador_id ? req.body.cot_usu_usuario_modificador_id : cotizacion_proyecto_update.dataValues.cot_usu_usuario_modificador_id,
                    cot_cmm_estatus_id: !!req.body.cot_cmm_estatus_id ? req.body.cot_cmm_estatus_id : cotizacion_proyecto_update.dataValues.cot_cmm_estatus_id,
                    cot_comentario: !!req.body.cot_comentario ? req.body.cot_comentario : cotizacion_proyecto_update.dataValues.cot_comentario,
                    cot_descuento: !!req.body.cot_descuento ? req.body.cot_descuento : cotizacion_proyecto_update.dataValues.cot_descuento,
                    cot_correo_electronico: !!req.body.cot_correo_electronico ? req.body.cot_correo_electronico : cotizacion_proyecto_update.dataValues.cot_correo_electronico,
                    cot_fecha_envio: !!req.body.cot_fecha_envio ? req.body.cot_fecha_envio : cotizacion_proyecto_update.dataValues.cot_fecha_envio,
                    cot_motivo_cancelacion: !!req.body.cot_motivo_cancelacion ? req.body.cot_motivo_cancelacion : cotizacion_proyecto_update.dataValues.cot_motivo_cancelacion
                });            
                const cotizacion_proyecto = await models.CotizacionProyecto.findOne({
                    where : {
                        cot_cotizacion_id: req.body.cot_cotizacion_id
                    },
                    include: [
                        {
                            model: models.ProductosCotizacionProyecto,
                            include: [
                                {
                                    model: models.Producto
                                }
                            ]
                        }
                    ]
                });
                res.status(200).send({
                    message: 'Proyecto/Cotización actualizada con exito',
                    cotizacion_proyecto
                });
            }else{
                res.status(300).send({
                    message: 'Proyecto/Cotización no existente'
                });
            }
        }catch(e){
            res.status(200).send({
                message: 'Error, al actualizar el proyecto/cotización',
                e
            });
            next(e);
        }
    },
    pasarProyectoCarrito: async(req, res, next) =>{
        try{
            const cotizacion_proyecto = await models.CotizacionProyecto.findOne({
                where: {
                    cot_cotizacion_id: req.body.cot_cotizacion_id
                },
                include: [
                    {
                        model: models.ProductosCotizacionProyecto
                    }
                ]
            });

            await cotizacion_proyecto.update({
                cot_usu_usuario_modificador_id: req.body.cot_usu_usuario_modificador_id
            })
            if(!!cotizacion_proyecto){
                const carrito_compra = await models.CarritoDeCompra.findOne({
                    where: {
                        cdc_numero_orden: cotizacion_proyecto.dataValues.cot_numero_orden
                    }
                });
                console.log('CARRITO_CARRITO', carrito_compra, !!carrito_compra);
                if(!!carrito_compra){
                    res.status(300).send({
                        message: 'No es posible realizar el traspaso, debido a que ya esta cargada en el carrito'
                    })
                }else{
                    
                    const total_compra = await sequelize.query(`
                    select 
                    sum(total.total)
                    from(
                    select 
                    case 
                        when pc.pc_mejor_descuento >= 10 then   (pc.pc_precio - (pc.pc_precio * cast(concat('0.' || pc.pc_mejor_descuento) as float))) * pc.pc_cantidad_producto
                        when pc.pc_mejor_descuento <= 9 then    (pc.pc_precio - (pc.pc_precio * cast(concat('0.0' || pc.pc_mejor_descuento) as float))) * pc.pc_cantidad_producto
                    end as total
                    from cotizaciones_proyectos cp  
                    left join productos_cotizaciones pc  on pc.pc_cot_cotizacion_id  = cp.cot_cotizacion_id 
                    where cp.cot_cotizacion_id  = ` + req.body.cot_cotizacion_id + ` 
                    )total
                    `,
                    {
                        type: sequelize.QueryTypes.SELECT
                    });
                    let total_de_la_compra = total_compra.length > 0 ? total_compra[0].sum : 0

                    let carrito = {
                        cdc_numero_orden: cotizacion_proyecto.dataValues.cot_numero_orden,
                        cdc_sn_socio_de_negocio_id: cotizacion_proyecto.dataValues.cot_sn_socios_negocio_id,
                        cdc_usu_usuario_vendedor_id: req.body.cot_usu_usuario_modificador_id,
                        cdc_descuento_extra: cotizacion_proyecto.dataValues.cot_descuento,
                        cdc_total_carrito: total_de_la_compra,
                        cdc_from_project: true,
                        cdc_with_coupon: false
                    };
                    const carrito_de_compra_final = await models.CarritoDeCompra.create(carrito);
                    if(!!carrito_de_compra_final){
                        if(cotizacion_proyecto.dataValues.producto_cotizaciones.length > 0){
                            cotizacion_proyecto.dataValues.producto_cotizaciones.forEach(async function(producto, indexProducto){
                                let producto_carrito = {
                                    pcdc_carrito_de_compra_id: carrito_de_compra_final.dataValues.cdc_carrito_de_compra_id,
                                    pcdc_precio: producto.dataValues.pc_precio,
                                    pcdc_prod_producto_id: producto.dataValues.pc_prod_producto_id,
                                    pcdc_producto_cantidad: producto.dataValues.pc_cantidad_producto,
                                    pcdc_mejor_descuento: producto.dataValues.pc_mejor_descuento
                                };
                                await models.ProductoCarritoDeCompra.create(producto_carrito);
                                if((cotizacion_proyecto.dataValues.producto_cotizaciones.length -1 ) == indexProducto){
                                    const productos_carrito_de_compras = await models.ProductoCarritoDeCompra.findAll({
                                        where: {
                                            pcdc_carrito_de_compra_id: carrito_de_compra_final.dataValues.cdc_carrito_de_compra_id
                                        },
                                        include: [
                                            {
                                                model: models.Producto,
                                                include: [
                                                    {
                                                        model: models.ImagenProducto
                                                    }
                                                ]
                                            }
                                        ]
                                    });
                                    res.status(200).send({
                                        message: 'Cotización enviada con exito al carrito',
                                        carrito_de_compra_final,
                                        productos_carrito_de_compras
                                    });
                                }
                            });
                        }else{
                            await models.CarritoDeCompra.destroy({
                                where: {
                                    cdc_carrito_de_compra_id: carrito_de_compra_final.dataValues.cdc_carrito_de_compra_id
                                }
                            });
                            res.status(300).send({
                                message: 'No es posible crear un carrito, con artirculos vacios'
                            });
                        }
                    }else{
                        res.status(300).send({
                            message: 'Ocurrio un error al crear el carrito de compra'
                        });
                    }
                }
            }else{
                //El carrito fue eliminado en el proceso ☹
                res.status(300).send({
                    message: 'Error, el carrito no exite o fue eliminado'
                });
            }
        }catch(e){
            res.status(500).send({
                message: 'Error al traspazar proyecto/cotizacion a carrito',
                e
            });
            next(e);
        }
    },
    deleteCotizacionProyecto: async(req, res, next) =>{
        try{
            const cotizacion_proyecto = await models.CotizacionProyecto.findOne({
                where: {
                    cot_cotizacion_id: req.body.cot_cotizacion_id
                }
            });
            if(cotizacion_proyecto.dataValues.cot_cmm_tipo_id == statusControles.TIPO_COTIZACION_PROYECTO.PROYECTO){
                cotizacion_proyecto.update({
                    cot_cmm_estatus_id : statusControles.ESTATUS_COTIZACION_PROYECTO.ELIMINADA,
                    cot_usu_usuario_modificador_id: req.body.cot_usu_usuario_modificador_id,
                    updatedAt: Date()
                });
                res.status(200).send({
                    message: 'Operación exitosa, eliminada correctamente.'
                });
            }else if(cotizacion_proyecto.dataValues.cot_cmm_tipo_id == statusControles.TIPO_COTIZACION_PROYECTO.COTIZACION){
                await models.ProductosCotizacionProyecto.destroy({
                    where: {pc_cot_cotizacion_id: req.body.cot_cotizacion_id}
                });
                await models.CotizacionProyecto.destroy({
                    where: {
                        cot_cotizacion_id: req.body.cot_cotizacion_id
                    }
                });
                res.status(200).send({
                    message: 'Operación exitosa, eliminada correctamente.'
                })
            }
        }catch(e){
            res.status(300).send({
                message: 'Erro, al generar la petición',
                e
            });
            next(e);
        }
    },
    sendCotizacionToCliente: async(req, res, next)=>{
        try{
            const cotizacion = await models.CotizacionProyecto.findOne({
                where: {
                    cot_cotizacion_id: req.body.cot_cotizacion_id
                }
            });
            const envio = await cotizacionEmail(cotizacion.dataValues.cot_correo_electronico, cotizacion.dataValues.cot_cotizacion_id);
            if(envio){
                res.status(200).send({
                    message: 'Cotización enviada correctamente'
                });
            }else{
                res.status(300).send({
                    message: 'Cotización no enviada.'
                });
            }
        }catch(e){
            res.status(300).send({
                message: 'La solicitud no se pudo completar adecuadamente',
                e
            });
            next(e);
        }
    },
    getCotizacionByIdUsuario: async(req, res, next) =>{
        try{
            console.log('usuario', req.params.id);
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
            if((usuario.dataValues.role.dataValues.rol_nombre == statusControles.ROLES_ADMIN.admin)  && (usuario.dataValues.role.dataValues.rol_tipo_rol_id == statusControles.TIPO_ROL_MENU.ADMINISTRADOR)){
                const cotizaciones_proyectos = await models.CotizacionProyecto.findAll({
                    where: {
                        cot_cmm_estatus_id: {
                            [Op.ne]: statusControles.ESTATUS_COTIZACION_PROYECTO.ELIMINADA
                        }
                    },
                    include: [
                        {
                            model: models.ControlMaestroMultiple,
                            as: 'estatus_cotizacion',
                            attributes: {
                                exclude: ['cmm_control_id','cmm_nombre','cmm_sistema','cmm_activo','cmm_usu_usuario_creado_por_id','createdAt','cmm_usu_usuario_modificado_por_id','updatedAt']
                            }
                        },
                        {
                            model: models.Usuario,
                            as: 'vendedor_id',
                            attributes: {
                                exclude: ['usu_contrasenia','usu_imagen_perfil_id','usu_rol_rol_id','usu_cmm_estatus_id','createdAt','usu_usuario_modificado_por_id','updatedAt']
                            }                                        
                        },
                        {
                            model: models.SociosNegocio,
                            attributes: {
                                exclude: ['sn_cfdi','sn_rfc','sn_credito','sn_direccion_facturacion','sn_razon_social','sn_email_facturacion','sn_direccion_empresa','sn_lista_precios','sn_descripcion_empresa','sn_cmm_estatus_id','sn_almacen_asignado','sn_usu_usuario_creador_id','createdAt','sn_usu_usuario_modificado_id','updatedAt']
                            }
                        },
                    ]
                });
                res.status(200).send({
                    message: 'Cotizaciones y proyectos',
                    cotizaciones_proyectos
                });
            }else if(usuario.dataValues.role.dataValues.rol_tipo_rol_id == statusControles.TIPO_ROL_MENU.VENDEDORES){
                if(usuario.dataValues.role.dataValues.rol_nombre == statusControles.ROLES_VENDEDORES.admin){
                    const usuarios_vendedores = await models.Usuario.findAll({
                        where: {
                            usu_usuario_creado_por_id: usuario.dataValues.usu_usuario_id,
                            usu_cmm_estatus_id: {
                                [Op.ne] : statusControles.ESTATUS_USUARIO.ELIMINADO
                            }
                        }
                    });
                    var idsUsuarios = [];
                    usuarios_vendedores.forEach(async function(elemento, index){
                        idsUsuarios.push(elemento.dataValues.usu_usuario_id);
                        if(index == (usuarios_vendedores.length - 1)){
                            const cotizaciones_proyectos = await models.CotizacionProyecto.findAll({
                                where: {
                                    cot_cmm_estatus_id: {
                                        [Op.ne]: statusControles.ESTATUS_COTIZACION_PROYECTO.ELIMINADA
                                    },
                                    cot_usu_usuario_vendedor_id: idsUsuarios
                                },
                                include: [
                                    {
                                        model: models.ControlMaestroMultiple,
                                        as: 'estatus_cotizacion',
                                        attributes: {
                                            exclude: ['cmm_control_id','cmm_nombre','cmm_sistema','cmm_activo','cmm_usu_usuario_creado_por_id','createdAt','cmm_usu_usuario_modificado_por_id','updatedAt']
                                        }
                                    },
                                    {
                                        model: models.SociosNegocio,
                                        attributes: {
                                            exclude: ['sn_cfdi','sn_rfc','sn_credito','sn_direccion_facturacion','sn_razon_social','sn_email_facturacion','sn_direccion_empresa','sn_lista_precios','sn_descripcion_empresa','sn_cmm_estatus_id','sn_almacen_asignado','sn_usu_usuario_creador_id','createdAt','sn_usu_usuario_modificado_id','updatedAt']
                                        }
                                    },
                                    {
                                        model: models.Usuario,
                                        as: 'vendedor_id',
                                        attributes: {
                                            exclude: ['usu_contrasenia','usu_imagen_perfil_id','usu_rol_rol_id','usu_cmm_estatus_id','createdAt','usu_usuario_modificado_por_id','updatedAt']
                                        }                                        
                                    }
                                ]
                            });
                            if(cotizaciones_proyectos.length > 0){
                                res.status(200).send({
                                    message: 'Proyectos y Cotizaciones', 
                                    cotizaciones_proyectos
                                });
                            }else{
                                res.status(200).send({
                                    message: 'No cuenta con registros disponibles'
                                })
                            }
                        }
                    });
                }else if(usuario.dataValues.role.dataValues.rol_nombre == statusControles.ROLES_VENDEDORES.vendedor){
                    const idsSociosNegocio = await models.UsuariosSociosDeNegocios.findAll({
                        where: {
                            usn_usu_usuario_id: usuario.dataValues.usu_usuario_id
                        }
                    });
                    var ids = [];
                    if(idsSociosNegocio.length > 0){
                        idsSociosNegocio.forEach(async function(elemento, index){
                            ids.push(elemento.dataValues.usn_sn_socio_de_negocio_id);
                            if(index == (idsSociosNegocio.length - 1)){
                                console.log('Eliminado', ids);
                                const cotizaciones_proyectos = await models.CotizacionProyecto.findAll({
                                    where: {
                                        cot_cmm_estatus_id: {
                                            [Op.ne]: statusControles.ESTATUS_COTIZACION_PROYECTO.ELIMINADA
                                        },
                                        cot_sn_socios_negocio_id: ids
                                    },
                                    include: [
                                        {
                                            model: models.ControlMaestroMultiple,
                                            as: 'estatus_cotizacion',
                                            attributes: {
                                                exclude: ['cmm_control_id','cmm_nombre','cmm_sistema','cmm_activo','cmm_usu_usuario_creado_por_id','createdAt','cmm_usu_usuario_modificado_por_id','updatedAt']
                                            }
                                        },
                                        {
                                            model: models.SociosNegocio,
                                            attributes: {
                                                exclude: ['sn_cfdi','sn_rfc','sn_credito','sn_direccion_facturacion','sn_razon_social','sn_email_facturacion','sn_direccion_empresa','sn_lista_precios','sn_descripcion_empresa','sn_cmm_estatus_id','sn_almacen_asignado','sn_usu_usuario_creador_id','createdAt','sn_usu_usuario_modificado_id','updatedAt']
                                            }
                                        },
                                        {
                                            model: models.Usuario,
                                            as: 'vendedor_id',
                                            attributes: {
                                                exclude: ['usu_contrasenia','usu_imagen_perfil_id','usu_rol_rol_id','usu_cmm_estatus_id','createdAt','usu_usuario_modificado_por_id','updatedAt']
                                            }                                        
                                        }
                                    ]
                                });
                                res.status(200).send({
                                    message: 'Socios de negocios',
                                    cotizaciones_proyectos
                                });
                            }
                        });
                    }else{
                        res.status(200).send({
                            message: 'Sin resultado en registros'
                        })
                    }
                }else{
                    res.status(300).send({
                        message: 'Usuario no valido, no cuenta con permisos'
                    })
                }
            }
        }catch(e){
            res.status(500).send({
                message: 'Error al crear contenido',
                e
            });
            next(e);
        }
    },

    //Old Cotizaciónes
    createCotizacionProyecto: async(req, res, next) =>{
        /*try{
            const carrito_de_compras = await models.CarritoDeCompra.findAll({
                where: {
                    carcop_numero_orden: req.body.cot_numero_orden
                }
            });
            const cantidad_proyecto = await models.ControlMaestroMultiple.findOne({
                where: {
                    cmm_nombre: 'PROYECTOS_CONTROL_CANTIDAD'
                }
            });
            
            const caducidadProyecto = await models.ControlMaestroMultiple.findOne({
                where: {
                    cmm_nombre: 'TIEMPO_CADUCIDAD_COTIZACION_PROYECTO'
                }
            });
            var pasa_to_proyecto = false;
            var grupos = [];
            await carrito_de_compras.forEach(async function(elemento, index){
                const tempProducto = await models.Producto.findOne({
                    where: {
                        prod_producto_id: elemento.dataValues.carcop_prod_producto_id
                    }
                });
                await grupos.push({
                    car_total: elemento.carcop_cantidad * tempProducto.dataValues.prod_precio,
                    prod_marca: tempProducto.dataValues.prod_mar_marca_id
                });
                if(grupos.length == (carrito_de_compras.length)){
                    const orderByFinal = await groupBy(grupos, 'prod_marca'); 
                    var eliminado = false;
                    if(orderByFinal){
                        for(let i in orderByFinal){
                            if(orderByFinal[i].car_total >= cantidad_proyecto.dataValues.cmm_valor){
                                pasa_to_proyecto = true;
                            }
                        }
                        if(!!req.body.cot_cotizacion_id){
                            const cotizacion_proyecto_find = await models.CotizacionProyecto.findOne({
                                where: {
                                    cot_cotizacion_id: req.body.cot_cotizacion_id,
                                    cot_cmm_tipo_id: statusControles.TIPO_COTIZACION_PROYECTO.PROYECTO
                                }
                            });
                            if(!!cotizacion_proyecto_find.dataValues){
                                carrito_de_compras.forEach(async function(elementos, index){
                                    const producto = await models.Producto.findOne({
                                        where:  {
                                            prod_producto_id: elementos.dataValues.carcop_prod_producto_id
                                        },
                                        include: [
                                            
                                            {
                                                model: models.Marca
                                            },
                                            {
                                                model: models.ControlMaestroMultiple
                                            }
                                        ]
                                    });
                                    const socio_negocio = await models.SociosNegocio.findOne({
                                        where: {
                                            sn_socios_negocio_id: req.body.cot_sn_socios_negocio_id
                                        }
                                    });
                                    const jsonDescuentos = [
                                        {
                                            nombre: 'producto', descuento: !!producto.dataValues.prod_descuento ? producto.dataValues.prod_descuento : 0
                                        },
                                        {
                                            nombre: 'marca', descuento: !!producto.dataValues.marca ? producto.dataValues.marca.dataValues.mar_descuento : 0
                                        },
                                        {
                                            nombre: 'socio_negocio', descuento: !!socio_negocio.dataValues.sn_descuento ? socio_negocio.dataValues.sn_descuento : 0
                                        }
                                    ];
                                    var oJSON = JSON.stringify(sortJSON(jsonDescuentos, 'descuento', 'desc'));
                                    if(producto.dataValues.prod_cmm_estatus_id != statusControles.ESTATUS_PRODUCTO.ACTIVO){
                                        eliminado = true;
                                    }else{
                                        if(elementos.dataValues.carcop_cantidad > 0){
                                            await models.ProductosCotizacionProyecto.destroy({
                                                where: {
                                                    pc_cot_cotizacion_id: cotizacion_proyecto_find.dataValues.cot_cotizacion_id,
                                                    pc_prod_producto_id: elementos.dataValues.carcop_prod_producto_id
                                                }
                                            });
                                            await models.ProductosCotizacionProyecto.create({
                                                pc_cot_cotizacion_id:  cotizacion_proyecto_find.dataValues.cot_cotizacion_id,
                                                pc_prod_producto_id: elementos.dataValues.carcop_prod_producto_id,
                                                pc_usu_usuario_vendedor_id: elementos.dataValues.carcop_usu_usuario_vendedor_id,
                                                pc_estatus_producto_cotizacion_id: statusControles.ESTUS_PRODUCTO_COTIZACION.PENDIENTE,
                                                pc_usu_usuario_creador_id: req.body.cot_usu_usuario_creador_id,
                                                pc_prod_precio: producto.dataValues.prod_precio,
                                                pc_cantidad_producto: elementos.dataValues.carcop_cantidad,
                                                pc_descuento_producto: oJSON
                                            });
                                        }
                                    }
                                    if((carrito_de_compras.length -1) == index){
                                        await models.CarritoDeCompra.destroy({
                                            where: {
                                                carcop_numero_orden: req.body.cot_numero_orden
                                            }
                                        });
                                        const productos_cotizacion = await models.ProductosCotizacionProyecto.findAll({
                                            where: {
                                                pc_cot_cotizacion_id : cotizacion_proyecto_find.dataValues.cot_cotizacion_id
                                            }
                                        });
                                        let totalCuenta = 0;
                                        productos_cotizacion.forEach(async function(producto, index2){
                                            totalCuenta = totalCuenta + ((producto.dataValues.pc_prod_precio - (producto.dataValues.pc_prod_precio * Number('.' +producto.dataValues.pc_descuento_producto[0]['descuento'])) ) * producto.dataValues.pc_cantidad_producto);
                                            if(index2 == (productos_cotizacion.length -1 )){
                                                cotizacion_proyecto_find.update({
                                                    cot_total_cotizacion: totalCuenta
                                                });
                                                res.status(200).send({
                                                    message: 'Cotización generada exitosamente. ' + eliminado ? 'Algunos productos se omitieron, pues no están disponibles' : ' Todos los productos fueron incluidos',
                                                    cotizacion_proyecto_find
                                                });
                                            }
                                        });
                                    }
                                });
                            }else{
                                res.status(300).send({
                                    message: 'Operación no permitida'
                                })
                            }
                        }else{
                            let diacreacion = new Date();
                            const cotizacion_proyecto = await models.CotizacionProyecto.create({
                                cot_numero_orden    : req.body.cot_numero_orden,
                                cot_proyecto_nombre : !!req.body.cot_proyecto_nombre & pasa_to_proyecto ? req.body.cot_proyecto_nombre : null,
                                cot_cmm_tipo_id: !!req.body.cot_proyecto_nombre && pasa_to_proyecto ? statusControles.TIPO_COTIZACION_PROYECTO.PROYECTO : statusControles.TIPO_COTIZACION_PROYECTO.COTIZACION,
                                cot_usu_usuario_creador_id  : req.body.cot_usu_usuario_creador_id,
                                cot_cmm_estatus_id  : req.body.cot_cmm_estatus_id,
                                cot_sn_socios_negocio_id    : req.body.cot_sn_socios_negocio_id,
                                cot_usu_usuario_vendedor_id : req.body.cot_usu_usuario_vendedor_id,
                                cot_fecha_vencimiento: sumarDias(diacreacion, Number(caducidadProyecto.dataValues.cmm_valor))
                            });
                            if(cotizacion_proyecto.dataValues){
                                carrito_de_compras.forEach(async function(elementos, index){
                                    const producto = await models.Producto.findOne({
                                        where:  {
                                            prod_producto_id: elementos.dataValues.carcop_prod_producto_id
                                        },
                                        include: [
                                            
                                            {
                                                model: models.Marca
                                            },
                                            {
                                                model: models.ControlMaestroMultiple
                                            }
                                        ]
                                    });
                                    const socio_negocio = await models.SociosNegocio.findOne({
                                        where: {
                                            sn_socios_negocio_id: req.body.cot_sn_socios_negocio_id
                                        }
                                    });
                                    const jsonDescuentos = [
                                        {
                                            nombre: 'producto', descuento: !!producto.dataValues.prod_descuento ? producto.dataValues.prod_descuento : 0
                                        },
                                        {
                                            nombre: 'marca', descuento: !!producto.dataValues.marca ? producto.dataValues.marca.dataValues.mar_descuento : 0
                                        },
                                        {
                                            nombre: 'socio_negocio', descuento: !!socio_negocio.dataValues.sn_descuento ? socio_negocio.dataValues.sn_descuento : 0
                                        }
                                    ];
                                    var oJSON = JSON.stringify(sortJSON(jsonDescuentos, 'descuento', 'desc'));
                                    if(producto.dataValues.prod_cmm_estatus_id != statusControles.ESTATUS_PRODUCTO.ACTIVO){
                                        eliminado = true;
                                    }else{
                                        if(elementos.dataValues.carcop_cantidad > 0){
                                            await models.ProductosCotizacionProyecto.create({
                                                pc_cot_cotizacion_id:  cotizacion_proyecto.dataValues.cot_cotizacion_id,
                                                pc_prod_producto_id: elementos.dataValues.carcop_prod_producto_id,
                                                pc_prod_precio: producto.dataValues.prod_precio,
                                                pc_usu_usuario_vendedor_id: elementos.dataValues.carcop_usu_usuario_vendedor_id,
                                                pc_estatus_producto_cotizacion_id: statusControles.ESTUS_PRODUCTO_COTIZACION.PENDIENTE,
                                                pc_usu_usuario_creador_id: req.body.cot_usu_usuario_creador_id,
                                                pc_cantidad_producto: elementos.dataValues.carcop_cantidad,
                                                pc_descuento_producto: oJSON
                                            });
                                        }
                                    }
                                    if((carrito_de_compras.length -1) == index){
                                        await models.CarritoDeCompra.destroy({
                                            where: {
                                                carcop_numero_orden: req.body.cot_numero_orden
                                            }
                                        });
                                        const productos_cotizacion = await models.ProductosCotizacionProyecto.findAll({
                                            where: {
                                                pc_cot_cotizacion_id : cotizacion_proyecto.dataValues.cot_cotizacion_id
                                            }
                                        });
                                        let totalCuenta = 0;
                                        productos_cotizacion.forEach(async function(producto, index2){
                                            totalCuenta = totalCuenta + ((producto.dataValues.pc_prod_precio - (producto.dataValues.pc_prod_precio * Number('.' +producto.dataValues.pc_descuento_producto[0]['descuento'])) ) * producto.dataValues.pc_cantidad_producto);
                                            if(index2 == (productos_cotizacion.length -1 )){
                                                cotizacion_proyecto.update({
                                                    cot_total_cotizacion: totalCuenta
                                                });
                                                res.status(200).send({
                                                    message: 'Cotización generada exitosamente. ' + eliminado ? 'Algunos productos se omitieron, pues no están disponibles' : ' Todos los productos fueron incluidos',
                                                    cotizacion_proyecto
                                                });
                                            }
                                        });
                                    }
                                });
                            }
                        }
                    }
                }
            });
            
            
        }catch(e){
            res.status(500).send({
                message: 'Error al crear contenido',
                e
            });
            next(e);
        }*/
        try{
            
            const carrito_de_compras = await models.CarritoDeCompra.findAll({
                where: {
                    carcop_numero_orden: req.body.cot_numero_orden
                },
                include: [
                    {
                        model: models.Producto,
                        include: [
                            {
                                model: models.Marca
                            }
                        ]
                    }
                ]
            });

            //Suma total de productos de carrito
            const total_pedido =  await sequelize.query("select  SUM(carcop_cantidad) from carrito_de_compras cdc where carcop_numero_orden = '"  + req.body.cot_numero_orden + "';", 
            { 
                type: sequelize.QueryTypes.SELECT 
            });
            //Agrupacion de marcas y cantidad de productos
            const marcasAgrupaciones =  await sequelize.query(`select distinct(p.prod_mar_marca_id), sum(cdc.carcop_cantidad) from carrito_de_compras cdc 
                                                        left join productos p on p.prod_producto_id  = cdc.carcop_prod_producto_id 
                                                        where cdc.carcop_numero_orden  = '`  + req.body.cot_numero_orden +`' 
                                                        group  by p.prod_mar_marca_id;` , 
            { 
                type: sequelize.QueryTypes.SELECT 
            });
            console.log('manager', total_pedido[0].sum, "\nMarcas", marcasAgrupaciones[0].sum);
            //Obtención... De % de marcas
            const marcas = await models.Marca.findAll({
                where: {
                    mar_cmm_estatus_id: { [Op.ne] : statusControles.ESTATUS_MARCAS.ELIMINADA },
                    mar_propiedades_extras: true
                }
            });
            let pasaProyecto = true;
            marcas.forEach(async function(item, index){
                marcasAgrupaciones.forEach(async function(itemMarca, index2){
                    if(item.dataValues.mar_marca_id == itemMarca.prod_mar_marca_id){
                        const idsCotizaciones = await sequelize.query(`
                            select distinct(cot_cotizacion_id) from ( 
                                select * from cotizaciones_proyectos cp 
                                left join productos_cotizaciones pc on pc.pc_cot_cotizacion_id = cp.cot_cotizacion_id 
                                left join productos p  on p.prod_producto_id = pc.pc_prod_producto_id 
                                where cp.cot_sn_socios_negocio_id = ` + req.body.cot_sn_socios_negocio_id + ` 
                            ) productos  where prod_mar_marca_id  = ` + itemMarca.prod_mar_marca_id +` ;`, 
                        { 
                            type: sequelize.QueryTypes.SELECT 
                        });
                        if(idsCotizaciones.length > 0){
                            idsCotizaciones.forEach(async function(cotizacion, index3){
                                //Suma total de productos de carrito
                                const total_cot_anterior =  await sequelize.query(`
                                    select sum(pc.pc_cantidad_producto) from cotizaciones_proyectos cp 
                                    left join productos_cotizaciones pc on pc.pc_cot_cotizacion_id = cp.cot_cotizacion_id 
                                    where cp.cot_cotizacion_id = ` + cotizacion.cot_cotizacion_id + `;`, 
                                { 
                                    type: sequelize.QueryTypes.SELECT 
                                });

                                const total_marca =  await sequelize.query(`
                                    select sum(pc_cantidad_producto) from (
                                        select * from cotizaciones_proyectos cp 
                                        left join productos_cotizaciones pc on pc.pc_cot_cotizacion_id = cp.cot_cotizacion_id 
                                        left join productos p  on p.prod_producto_id = pc.pc_prod_producto_id 
                                        where cp.cot_sn_socios_negocio_id = ` + req.body.cot_sn_socios_negocio_id + `
                                    ) productos  where prod_mar_marca_id  = ` + itemMarca.prod_mar_marca_id  + ` and cot_cotizacion_id = ` + cotizacion.cot_cotizacion_id + `;`, 
                                { 
                                    type: sequelize.QueryTypes.SELECT 
                                });
                                if((!!total_cot_anterior[0].sum && !!total_marca[0].sum)){
                                    if(!!item.dataValues.mar_cantidad_producto){
                                        if (item.dataValues.mar_cantidad_producto < Number((((total_marca[0].sum * 100) / total_cot_anterior[0].sum).toPrecision(2)))){
                                            pasaProyecto = false;
                                        }
                                    }else if(item.dataValues.mar_limitante){
                                        if (100 == Number((((total_marca[0].sum * 100) / total_cot_anterior[0].sum).toPrecision(2)))){
                                            pasaProyecto = false;
                                        }

                                    }
                                }
                                if(((marcas.length - 1) == index)  && ((idsCotizaciones.length -1) == index3)){
                                    console.log('TERMINO');
                                    res.status(200).send({
                                        message: pasaProyecto ?  'Creación de proyecto exitosa' :  'Creación de cotización exitosa',
                                        carrito_de_compras,
                                        total_pedido
                                    })
                                }
                            });
                        }else{
                            console.log('RESULTADO', itemMarca.sum, total_pedido[0].sum, Number(((itemMarca.sum* 100) / total_pedido[0].sum).toPrecision(2)) );
                            if(item.dataValues.mar_limitante && (Number(((itemMarca.sum* 100) / total_pedido[0].sum).toPrecision(2)) == 100)){
                                pasaProyecto = true;
                            }
                            else if(item.dataValues.mar_cantidad_producto > Number(((itemMarca.sum* 100) / total_pedido[0].sum).toPrecision(2)) && !item.dataValues.mar_limitante){
                                console.log('Es menor al 49 pasa', item.dataValues.mar_marca_id, (item.dataValues.mar_cantidad_producto > Number(((itemMarca.sum* 100) / total_pedido[0].sum).toPrecision(2))) );
                            }
                            if((marcasAgrupaciones.length - 1) == index2){
                                res.status(200).send({
                                    message: 'Exito, sin nada que hacer'
                                })
                            }
                        }
                    }
                });
            });
        }catch(e){
            res.status(500).send({
                message: 'Error, al procesar la petición',
                e
            });
            next(e);
        }
    },
    aceptProductoCotizacion: async(req, res, next) =>{
        try{
            if(req.body.productos){
                //consulta todos los articulos en pendientes, para proceder con la aceptación
                const productos_cotizacion = await models.ProductosCotizacionProyecto.findAll({
                    where:{
                        pc_cot_cotizacion_id: req.body.pc_cot_cotizacion_id,
                        pc_estatus_producto_cotizacion_id: statusControles.ESTUS_PRODUCTO_COTIZACION.PENDIENTE
                    }
                });;
                //Ponemos todos los articulos en estatus declinado, para proceder con la aprobación
                productos_cotizacion.forEach(async function(prod, index){
                    await prod.update({
                        pc_estatus_producto_cotizacion_id: statusControles.ESTUS_PRODUCTO_COTIZACION.DECLINADO,
                        pc_usu_usuario_modificado_por_id: req.body.pc_usu_usuario_modificado_por_id
                    });
                })
                req.body.productos.forEach(async function(elemento, index){
                    const toUpdateAutoritation = await models.ProductosCotizacionProyecto.findOne({
                        where: {
                            pc_cot_cotizacion_id: req.body.pc_cot_cotizacion_id,
                            pc_prod_producto_id: elemento.pc_prod_producto_id
                        }
                    });
                    toUpdateAutoritation.update({
                            pc_estatus_producto_cotizacion_id: statusControles.ESTUS_PRODUCTO_COTIZACION.APROBADO
                    });
                    console.log('udapt', toUpdateAutoritation);
                    if(index == (req.body.productos.length - 1)){
                        await models.ProductosCotizacionProyecto.destroy({
                            where:{
                                pc_cot_cotizacion_id: req.body.pc_cot_cotizacion_id,
                                pc_estatus_producto_cotizacion_id: statusControles.ESTUS_PRODUCTO_COTIZACION.DECLINADO
                                
                            }
                        });
                        res.status(200).send({
                            message: 'Operación realiada con exito'
                        });
                    }
                });
            }else{
                res.status(300).send({
                    message: 'Datos incompletos, revisa la informació.'
                })
            }
        }catch(e){
            res.status(500).send({
                message: 'Error al crear contenido',
                e
            });
            next(e);
        }
    },
    getCotizacionByIdSocioNegocio: async(req, res, next) =>{
        try{
            const cotizaciones_proyectos = await models.CotizacionProyecto.findAll({
                where: {
                    cot_cmm_estatus_id: {
                        [Op.ne]: statusControles.ESTATUS_COTIZACION_PROYECTO.ELIMINADA
                    },
                    cot_sn_socios_negocio_id: req.params.id
                },
                include: [
                    {
                        model: models.ControlMaestroMultiple,
                        as: 'estatus_cotizacion',
                        attributes: {
                            exclude: ['cmm_control_id','cmm_nombre','cmm_sistema','cmm_activo','cmm_usu_usuario_creado_por_id','createdAt','cmm_usu_usuario_modificado_por_id','updatedAt']
                        }
                    },
                    {
                        model: models.SociosNegocio,
                        attributes: {
                            exclude: ['sn_cfdi','sn_rfc','sn_credito','sn_direccion_facturacion','sn_razon_social','sn_email_facturacion','sn_direccion_empresa','sn_lista_precios','sn_descripcion_empresa','sn_cmm_estatus_id','sn_almacen_asignado','sn_usu_usuario_creador_id','createdAt','sn_usu_usuario_modificado_id','updatedAt']
                        }
                    },
                    {
                        model: models.Usuario,
                        as: 'vendedor_id',
                        attributes: {
                            exclude: ['usu_contrasenia','usu_imagen_perfil_id','usu_rol_rol_id','usu_cmm_estatus_id','createdAt','usu_usuario_modificado_por_id','updatedAt']
                        }                                        
                    }
                ]
            })
            res.status(200).send({
                message: 'Cotizaciones y proyectos',
                cotizaciones_proyectos
            });
        }catch(e){
            res.status(500).send({
                message: 'Error al crear contenido',
                e
            });
            next(e);
        }
    },
    getCotizacionProyectoById: async(req, res, next) =>{
        try{
            const cotizacion_proyecto = await models.CotizacionProyecto.findOne({
                where: {
                    cot_cotizacion_id: req.params.id
                },
                include: [
                    {
                        model: models.ControlMaestroMultiple,
                        as: 'estatus_cotizacion',
                        attributes: {
                            exclude: ['cmm_control_id','cmm_nombre','cmm_sistema','cmm_activo','cmm_usu_usuario_creado_por_id','createdAt','cmm_usu_usuario_modificado_por_id','updatedAt']
                        }
                    },
                    {
                        model: models.ControlMaestroMultiple,
                        as: 'tipo_cotizacion',
                        attributes: {
                            exclude: ['cmm_control_id','cmm_nombre','cmm_sistema','cmm_activo','cmm_usu_usuario_creado_por_id','createdAt','cmm_usu_usuario_modificado_por_id','updatedAt']
                        }
                    },
                    {
                        model: models.ProductosCotizacionProyecto,
                        include: [
                            {
                                model: models.Producto,
                                include: [
                                    {
                                        model: models.ImagenProducto
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        model: models.SociosNegocio,
                        attributes: {
                            exclude: ['sn_tax','sn_direccion_facturacion','sn_razon_social','sn_nombre_comercial','sn_email_facturacion','sn_telefono_empresa','sn_pais_id','sn_estado_id','sn_direccion_empresa','sn_lista_precios','sn_descripcion_empresa','sn_cmm_estatus_id','sn_almacen_asignado','sn_usu_usuario_creador_id','createdAt','sn_usu_usuario_modificado_id','updatedAt']
                        }
                    },
                    {
                        model: models.Usuario,
                        as: 'vendedor_id',
                        attributes: {
                            exclude: ['usu_contrasenia','usu_imagen_perfil_id','usu_rol_rol_id','usu_cmm_estatus_id','createdAt','usu_usuario_modificado_por_id','updatedAt']
                        }
                    }
                ]
            });
            res.status(200).send({
                message: 'Operación realiada con exito',
                cotizacion_proyecto
            });
        }catch(e){
            res.status(500).send({
                message: 'Error al crear contenido',
                e
            });
            next(e);
        }
    },
    getCotizacionByIdSocioNegocioAdmin: async(req, res, next) =>{
        try{
            const cotizaciones_proyectos = await models.CotizacionProyecto.findAll({
                where: {
                    cot_cmm_estatus_id: {
                        [Op.ne]: statusControles.ESTATUS_COTIZACION_PROYECTO.ELIMINADA
                    },
                    cot_sn_socios_negocio_id: req.params.id
                },
                include: [
                    {
                        model: models.ControlMaestroMultiple,
                        as: 'estatus_cotizacion',
                        attributes: {
                            exclude: ['cmm_control_id','cmm_nombre','cmm_sistema','cmm_activo','cmm_usu_usuario_creado_por_id','createdAt','cmm_usu_usuario_modificado_por_id','updatedAt']
                        }
                    },
                    {
                        model: models.ControlMaestroMultiple,
                        as: 'tipo_cotizacion',
                        attributes: {
                            exclude: ['cmm_control_id','cmm_nombre','cmm_sistema','cmm_activo','cmm_usu_usuario_creado_por_id','createdAt','cmm_usu_usuario_modificado_por_id','updatedAt']
                        }
                    },
                    {
                        model: models.SociosNegocio,
                        attributes: {
                            exclude: ['sn_tax','sn_direccion_facturacion','sn_razon_social','sn_nombre_comercial','sn_email_facturacion','sn_telefono_empresa','sn_pais_id','sn_estado_id','sn_direccion_empresa','sn_lista_precios','sn_descripcion_empresa','sn_cmm_estatus_id','sn_almacen_asignado','sn_usu_usuario_creador_id','createdAt','sn_usu_usuario_modificado_id','updatedAt']
                        }
                    },
                    {
                        model: models.Usuario,
                        as: 'vendedor_id',
                        attributes: {
                            exclude: ['usu_contrasenia','usu_imagen_perfil_id','usu_rol_rol_id','usu_cmm_estatus_id','createdAt','usu_usuario_modificado_por_id','updatedAt']
                        }
                    }
                ]
            });
            res.status(200).send({
                message: 'Cotizaciones y proyectos',
                cotizaciones_proyectos
            });
        }catch(e){
            res.status(500).send({
                message: 'Error al crear contenido',
                e
            });
            next(e);
        }
    },
    updateCotizacionProyecto: async(req, res, next)  =>{
        try{
            const cotizacion_proyecto = await models.CotizacionProyecto.findOne({
                where: {
                    cot_cotizacion_id: req.body.cot_cotizacion_id
                },
                include: [
                    {
                        model: models.ProductosCotizacionProyecto
                    }
                ]
            });
            let diacreacion = new Date();
            
            const descuentoExtra = await models.ControlMaestroMultiple.findOne({
                where: {
                    cmm_nombre: 'DESCUENTO_MAXIMO_COTIZACION_PROYECTO'
                }
            });
            const caducidadProyecto = await models.ControlMaestroMultiple.findOne({
                where: {
                    cmm_nombre: 'TIEMPO_CADUCIDAD_COTIZACION_PROYECTO'
                }
            });
            console.log('DESCUENTO', descuentoExtra.dataValues.cmm_valor)
            let autorizacion = false;
            const usuarioModificador = await models.Usuario.findOne({
                where: {
                    usu_usuario_id: req.body.cot_usu_usuario_modificador_id
                },
                include: [
                    {
                        model: models.Rol
                    }
                ]
            });
            if(!!usuarioModificador){
                console.log(usuarioModificador.dataValues.role.dataValues.rol_tipo_rol_id);
                if(usuarioModificador.dataValues.role.dataValues.rol_tipo_rol_id == statusControles.TIPO_ROL_MENU.ADMINISTRADOR){
                    console.log('ESTE ES ADMINISTRADOR');
                    autorizacion = true;
                }else if((usuarioModificador.dataValues.role.dataValues.rol_tipo_rol_id == statusControles.TIPO_ROL_MENU.VENDEDORES) && (usuarioModificador.dataValues.role.dataValues.rol_nombre == statusControles.ROLES_VENDEDORES.admin)){
                    console.log('Este es gerente');
                    autorizacion = true;
                }
            }
            await cotizacion_proyecto.update({
                cot_proyecto_nombre: !!req.body.cot_proyecto_nombre ? req.body.cot_proyecto_nombre : cotizacion_proyecto.dataValues.cot_proyecto_nombre,
                cot_cmm_tipo_id: !!req.body.cot_cmm_tipo_id ? req.body.cot_cmm_tipo_id : cotizacion_proyecto.dataValues.cot_cmm_tipo_id,
                cot_cmm_estatus_id: !!req.body.cot_cmm_estatus_id ? req.body.cot_cmm_estatus_id : cotizacion_proyecto.dataValues.cot_cmm_estatus_id,
                cot_fecha_vencimiento: sumarDias(diacreacion, Number(caducidadProyecto.dataValues.cmm_valor)),
                cot_usu_usuario_modificador_id: !!req.body.cot_usu_usuario_modificador_id ? req.body.cot_usu_usuario_modificador_id : cotizacion_proyecto.dataValues.cot_usu_usuario_modificador_id,
                cot_comentario: !!req.body.cot_comentario ? req.body.cot_comentario : cotizacion_proyecto.dataValues.cot_comentario,
                cot_correo_electronico: !!req.body.cot_correo_electronico ? req.body.cot_correo_electronico : cotizacion_proyecto.dataValues.cot_correo_electronico,
                cot_motivo_cancelacion: !!req.body.cot_motivo_cancelacion ? req.body.cot_motivo_cancelacion : cotizacion_proyecto.dataValues.cot_motivo_cancelacion,
                cot_descuento_extra: (!!req.body.cot_descuento_extra && (req.body.cot_descuento_extra >= Number(descuentoExtra.dataValues.cmm_valor)) && autorizacion) ? req.body.cot_descuento_extra  : (!!req.body.cot_descuento_extra && (req.body.cot_descuento_extra <= Number(descuentoExtra.dataValues.cmm_valor))) ? req.body.cot_descuento_extra : cotizacion_proyecto.dataValues.cot_descuento_extra
            });
            if(!!req.body.producto_cotizaciones){
                await models.ProductosCotizacionProyecto.destroy({
                    where: {
                        pc_cot_cotizacion_id: req.body.cot_cotizacion_id
                    }   
                });
                req.body.producto_cotizaciones.forEach(async function (producto, index){
                    const productoSearch = await models.Producto.findOne({
                        where:  {
                            prod_producto_id: producto.pc_prod_producto_id
                        },
                        include: [
                            {
                                model: models.Marca
                            },
                            {
                                model: models.ControlMaestroMultiple
                            }
                        ]
                    });
                    const socio_negocio = await models.SociosNegocio.findOne({
                        where: {
                            sn_socios_negocio_id: cotizacion_proyecto.dataValues.cot_sn_socios_negocio_id
                        }
                    });
                    const jsonDescuentos = [
                        {
                            nombre: 'producto', descuento: !!productoSearch.dataValues.prod_descuento ? productoSearch.dataValues.prod_descuento : 0
                        },
                        {
                            nombre: 'marca', descuento: !!productoSearch.dataValues.marca ? productoSearch.dataValues.marca.dataValues.mar_descuento : 0
                        },
                        {
                            nombre: 'socio_negocio', descuento: !!socio_negocio.dataValues.sn_descuento ? socio_negocio.dataValues.sn_descuento : 0
                        }
                    ];
                    var oJSON = JSON.stringify(sortJSON(jsonDescuentos, 'descuento', 'desc'));
                    await models.ProductosCotizacionProyecto.create({
                        pc_cot_cotizacion_id: req.body.cot_cotizacion_id,
                        pc_prod_producto_id: productoSearch.dataValues.prod_producto_id,
                        pc_usu_usuario_vendedor_id: req.body.cot_usu_usuario_modificador_id,
                        pc_usu_usuario_creador_id: req.body.cot_usu_usuario_modificador_id,
                        pc_estatus_producto_cotizacion_id: statusControles.ESTATUS_COTIZACION_PROYECTO.ACTIVO, 
                        pc_prod_precio: productoSearch.dataValues.prod_precio,
                        pc_cantidad_producto: producto.pc_cantidad_producto,
                        pc_descuento_producto: oJSON
                    });
                    if(index == (req.body.producto_cotizaciones.length - 1)){
                        const productos_cotizacion = await models.ProductosCotizacionProyecto.findAll({
                            where: {
                                pc_cot_cotizacion_id : cotizacion_proyecto.dataValues.cot_cotizacion_id
                            }
                        });
                        let totalCuenta = 0;
                        productos_cotizacion.forEach(async function(producto, index2){
                            totalCuenta = totalCuenta + ((producto.dataValues.pc_prod_precio - (producto.dataValues.pc_prod_precio * Number('.' +producto.dataValues.pc_descuento_producto[0]['descuento'])) ) * producto.dataValues.pc_cantidad_producto);
                            let descuento_extra_sobre_cotizacion = !!req.body.cot_descuento_extra ? totalCuenta - (totalCuenta * Number('.' + req.body.cot_descuento_extra)) : 0;
                            if(index2 == (productos_cotizacion.length -1 )){
                                cotizacion_proyecto.update({
                                    cot_total_cotizacion: totalCuenta
                                });
                                res.status(200).send({
                                    message: 'Actualización correcta',
                                    cotizacion_proyecto,
                                    descuento_extra_sobre_cotizacion
                                });
                            }
                        });
                    }
                });
            }else{
                res.status(200).send({
                    message: 'Actualización correcta'
                });
            }
        }catch(e){
            res.status(300).send({
                message: 'Error, al crear la petición',
                e
            });
            next(e);
        }
    },
};