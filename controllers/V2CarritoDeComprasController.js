import models from '../models';
import { Sequelize } from 'sequelize';
const sequelize = new Sequelize(process.env.POSTGRESQL);
const { Op } = require("sequelize");
import request from 'request-promise';
import statusControllers from '../mapeos/mapeoControlesMaestrosMultiples';
import productosUtils from "../services/productosUtils";
import cotizarCarritoFunction from "../services/cotizarCarritoFunctions";
import getCheckout from "../services/checkoutAPI";
import CreacionOrdenSAP from "../services/CreacionOrdenSAP";
const fs = require('fs');
const DIR = './public/excel/temp';

const {ordenCreadaEmail} = require('../services/ordenCreadaEmail');
const {correoEntregadoEmail} = require('../services/correoEntregadoEmail');
const {ordenCreadaUsuarioDielsaEmail} = require('../services/ordenCreadaUsuarioDielsaEmail');
const {ordenAbiertaCreadaEmail} = require('../services/ordenAbiertaCreadaEmail');

import date_and_time from 'date-and-time';


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

const cantidadAgregar = async function (cantidad, promocion){
    let productos_regalo = 0;
    if(promocion == statusControllers.TIPO_PROMOCION['3 X 2']){
        productos_regalo = cantidad / 3;
        console.log(productos_regalo);
        productos_regalo = Math.floor(productos_regalo);
        return  productos_regalo;
    }else if(promocion == statusControllers.TIPO_PROMOCION['2 X 1']){
        productos_regalo = cantidad / 2;
        productos_regalo = Math.floor(productos_regalo);
        return  productos_regalo;
    }
}

export default{

    //Obtiene carrito y Lo genera si el Socio de negocio no tiene uno asignado
    getCart: async(req, res, next) =>{
        try{
            var cdc_sn_socio_de_negocio_id = req.body.cdc_sn_socio_de_negocio_id
            var getCart = await getCheckout.getCartAPI(req.body.cdc_sn_socio_de_negocio_id);
 
            //Retornara el id del nuevo carrito
            res.status(200).send({
                message: 'Carrito Obtenido Con Exito',
                constCarritoDeCompraRecienCreado: getCart
            })
        }
        catch(e){
            res.status(500).send({
                message: 'Error al agregar producto al carrito',
                e
            });
            next(e);
        }
    },

    addProductToCart: async(req, res, next) =>{
        try{
            //Borrara todos los metodos de envio al modificar cantidades de productos
            var borrarEnvioBool = await productosUtils.EraseShippingMethod(req.body.cdc_sn_socio_de_negocio_id);

            var cdc_sn_socio_de_negocio_id = req.body.cdc_sn_socio_de_negocio_id

            //Buscara si el Socio de negocio tiene un carrito activo.
            const constCarritoDeCompra = await models.CarritoDeCompra.findOne(
            {
                where: {
                    cdc_sn_socio_de_negocio_id: cdc_sn_socio_de_negocio_id
                }
            });

            //Si tiene carrito intentara agregar o actualizar el carrito
            if(constCarritoDeCompra)
            {
                //Buscara si el Socio de negocio tiene un carrito activo.
                var carrito_id = constCarritoDeCompra.dataValues.cdc_carrito_de_compra_id
                var producto_id = req.body.prod_producto_id
                var cantidad = req.body.cantidad

                //Valida si existe el producto en el carrito
                const constProductoCarritoDeCompra = await models.ProductoCarritoDeCompra.findOne(
                {
                    where: {
                        pcdc_prod_producto_id: producto_id,
                        pcdc_carrito_de_compra_id: carrito_id
                    }
                })

                //Si es carrito existe y el producto esta
                if(constProductoCarritoDeCompra)
                {
                    //Actualizar la cantidad porque el ID del producto ya existe para ese carrito
                    await constProductoCarritoDeCompra.update({
                        pcdc_producto_cantidad: cantidad,
                        updatedAt: Date()
                    });

                    //Retorna el id del carrito segun el id del SN
                    res.status(200).send({
                        message: 'Se agrego correctamente el articulo.'
                    })
                }
                else
                {
                    //JSON para agregar un producto al carrito
                    const bodyCreate = {
                        "pcdc_carrito_de_compra_id": carrito_id,
                        "pcdc_prod_producto_id": producto_id,
                        "pcdc_producto_cantidad": cantidad
                    };
                    
                    //Const que genera el id del sn
                    const exito = await models.ProductoCarritoDeCompra.create(bodyCreate)

                    //Retorna el id del carrito segun el id del SN
                    res.status(200).send({
                        message: 'Se agrego correctamente el articulo.'
                    })
                }
            }


            //Else por si todavia no se a creado el carrito cosa que no deberia pasar.
            else
            {
                //Retornara el id del nuevo carrito
                res.status(200).send({
                    message: 'El Socio de negocio no tiene un carrito asignado'
                })
            }
        }
        catch(e){
            res.status(500).send({
                message: 'Error al agregar producto al carrito',
                e
            });
            next(e);
        }
    },

    deleteProductToCart: async(req, res, next) =>{
        try{
            //Borrara todos los metodos de envio al modificar cantidades de productos
            var borrarEnvioBool = await productosUtils.EraseShippingMethod(req.body.cdc_sn_socio_de_negocio_id);

            var cdc_sn_socio_de_negocio_id = req.body.cdc_sn_socio_de_negocio_id

            //Buscara si el Socio de negocio tiene un carrito activo.
            const constCarritoDeCompra = await models.CarritoDeCompra.findOne(
            {
                where: {
                    cdc_sn_socio_de_negocio_id: cdc_sn_socio_de_negocio_id
                }
            });

            //Si tiene carrito intentara agregar o actualizar el carrito
            if(constCarritoDeCompra)
            {
                //Buscara si el Socio de negocio tiene un carrito activo.
                var carrito_id = constCarritoDeCompra.dataValues.cdc_carrito_de_compra_id
                var producto_id = req.body.prod_producto_id

                //Valida si existe el producto en el carrito
                const constProductoCarritoDeCompra = await models.ProductoCarritoDeCompra.findOne(
                {
                    where: {
                        pcdc_prod_producto_id: producto_id,
                        pcdc_carrito_de_compra_id: carrito_id
                    }
                })

                //Si es carrito existe y el producto esta
                if(constProductoCarritoDeCompra)
                {
                    //Actualizar la cantidad porque el ID del producto ya existe para ese carrito
                    await constProductoCarritoDeCompra.destroy();

                    //Retorna el id del carrito segun el id del SN
                    res.status(200).send({
                        message: 'Se elimino el articulo del carrito.'
                    })
                }
                else
                {
                    //El SKU/ID de producto no existe en los productos carrito
                    res.status(200).send({
                        message: 'El Socio de negocio no tiene este articulo en su carrito.'
                    })
                }
            }


            //Else por si todavia no se a creado el carrito cosa que no deberia pasar.
            else
            {
                //Retornara el id del nuevo carrito
                res.status(200).send({
                    message: 'El Socio de negocio no tiene un carrito asignado'
                })
            }
        }
        catch(e){
            res.status(500).send({
                message: 'Error al agregar producto al carrito',
                e
            });
            next(e);
        }
    },










    addProductToCartFibra: async(req, res, next) =>{
        try{
            //Borrara todos los metodos de envio al modificar cantidades de productos
            var borrarEnvioBool = await productosUtils.EraseShippingMethod(req.body.cdc_sn_socio_de_negocio_id);

            var cdc_sn_socio_de_negocio_id = req.body.cdc_sn_socio_de_negocio_id

            //Buscara si el Socio de negocio tiene un carrito activo.
            const constCarritoDeCompra = await models.CarritoDeCompra.findOne(
            {
                where: {
                    cdc_sn_socio_de_negocio_id: cdc_sn_socio_de_negocio_id
                }
            });

            //Si tiene carrito intentara agregar o actualizar el carrito
            if(constCarritoDeCompra)
            {

                //Buscara si el Socio de negocio tiene un carrito activo.
                var carrito_id = constCarritoDeCompra.dataValues.cdc_carrito_de_compra_id
                var producto_id = req.body.prod_producto_id
                var cantidad = req.body.cantidad



                //Validar que el producto sea fibra optica
                const constProducto = await models.Producto.findOne(
                {
                    where: {
                        prod_producto_id: req.body.prod_producto_id
                    },
                    attributes: ["prod_codigo_grupo"]
                })

                //Si el producto existe
                if(constProducto)
                {
                    //Validar que el producto sea fibra optica
                    const constCategoria = await models.Categoria.findOne(
                    {
                        where: {
                            cat_categoria_id: constProducto.prod_codigo_grupo
                        }
                    })



                    if(constCategoria.cat_nombre == "FIBRA OPTICA")
                    {


                        //existe lote
                        const constStockProductoDetalle = await models.StockProductoDetalle.findOne(
                        {
                            where: {
                                spd_prod_producto_id: req.body.prod_producto_id,
                                spd_codigo_lote: req.body.pcdc_lote_detail
                            }
                        })

                        if(constStockProductoDetalle)
                        {
                            //Valida si existe el producto en el carrito junto con su lote
                            const constProductoCarritoDeCompra = await models.ProductoCarritoDeCompra.findOne(
                            {
                                where: {
                                    pcdc_prod_producto_id: producto_id,
                                    pcdc_carrito_de_compra_id: carrito_id,
                                    pcdc_lote_detail: req.body.pcdc_lote_detail
                                }
                            })


                            //Si es carrito existe y el producto esta
                            if(constProductoCarritoDeCompra)
                            {
                                //Actualizar la cantidad porque el ID del producto ya existe para ese carrito
                                await constProductoCarritoDeCompra.update({
                                    pcdc_producto_cantidad: cantidad,
                                    updatedAt: Date()
                                });

                                //Retorna el id del carrito segun el id del SN
                                res.status(200).send({
                                    message: 'Se agrego correctamente el articulo.'
                                })
                            }
                            else
                            {
                                //JSON para agregar un producto al carrito
                                const bodyCreate = {
                                    "pcdc_carrito_de_compra_id": carrito_id,
                                    "pcdc_prod_producto_id": producto_id,
                                    "pcdc_producto_cantidad": cantidad,
                                    "pcdc_lote_detail": req.body.pcdc_lote_detail
                                };
                                
                                //Const que genera el id del sn
                                const exito = await models.ProductoCarritoDeCompra.create(bodyCreate)

                                //Retorna el id del carrito segun el id del SN
                                res.status(200).send({
                                    message: 'Se agrego correctamente el articulo.'
                                })
                            }


                        }
                        else
                        {
                            res.status(200).send({
                                message: 'Lote no existe'
                            })
                        }
                    }
                    else
                    {
                        res.status(200).send({
                            message: 'Producto no es Fibra Optica'
                        })
                    }
                }
                else
                {
                    res.status(200).send({
                        message: 'Producto no existe'
                    })
                }
                
            }


            //Else por si todavia no se a creado el carrito cosa que no deberia pasar.
            else
            {
                //Retornara el id del nuevo carrito
                res.status(200).send({
                    message: 'El Socio de negocio no tiene un carrito asignado'
                })
            }
        }
        catch(e){
            res.status(500).send({
                message: 'Error al agregar producto al carrito',
                e
            });
            next(e);
        }
    },

    deleteProductToCartFibra: async(req, res, next) =>{
        try{
            //Borrara todos los metodos de envio al modificar cantidades de productos
            var borrarEnvioBool = await productosUtils.EraseShippingMethod(req.body.cdc_sn_socio_de_negocio_id);

            var cdc_sn_socio_de_negocio_id = req.body.cdc_sn_socio_de_negocio_id

            //Buscara si el Socio de negocio tiene un carrito activo.
            const constCarritoDeCompra = await models.CarritoDeCompra.findOne(
            {
                where: {
                    cdc_sn_socio_de_negocio_id: cdc_sn_socio_de_negocio_id
                }
            });


            //Si tiene carrito intentara agregar o actualizar el carrito
            if(constCarritoDeCompra)
            {
                //Buscara si el Socio de negocio tiene un carrito activo.
                var carrito_id = constCarritoDeCompra.dataValues.cdc_carrito_de_compra_id
                var producto_id = req.body.prod_producto_id
                var cantidad = req.body.cantidad


                //Validar que el producto sea fibra optica
                const constProducto = await models.Producto.findOne(
                {
                    where: {
                        prod_producto_id: req.body.prod_producto_id
                    },
                    attributes: ["prod_codigo_grupo"]
                })

                //Si el producto existe
                if(constProducto)
                {
                    //Validar que el producto sea fibra optica
                    const constCategoria = await models.Categoria.findOne(
                    {
                        where: {
                            cat_categoria_id: constProducto.prod_codigo_grupo
                        }
                    })


                    if(constCategoria.cat_nombre == "FIBRA OPTICA")
                    {
                        //Valida si existe el producto en el carrito junto con su lote
                        const constProductoCarritoDeCompra = await models.ProductoCarritoDeCompra.findOne(
                        {
                            where: {
                                pcdc_prod_producto_id: producto_id,
                                pcdc_carrito_de_compra_id: carrito_id,
                                pcdc_lote_detail: req.body.pcdc_lote_detail
                            }
                        })

                        //Si es carrito existe y el producto esta
                        if(constProductoCarritoDeCompra)
                        {
                            //Actualizar la cantidad porque el ID del producto ya existe para ese carrito
                            await constProductoCarritoDeCompra.destroy();

                            //Retorna el id del carrito segun el id del SN
                            res.status(200).send({
                                message: 'Se elimino el articulo del carrito.'
                            })
                        }
                        else
                        {
                            //El SKU/ID de producto no existe en los productos carrito
                            res.status(200).send({
                                message: 'El Socio de negocio no tiene este articulo en su carrito.'
                            })
                        }
                    }
                    else
                    {
                        res.status(200).send({
                            message: 'Producto no es Fibra Optica'
                        })
                    }
                }
                else
                {
                    res.status(200).send({
                        message: 'Producto no existe'
                    })
                }
                
            }


            //Else por si todavia no se a creado el carrito cosa que no deberia pasar.
            else
            {
                //Retornara el id del nuevo carrito
                res.status(200).send({
                    message: 'El Socio de negocio no tiene un carrito asignado'
                })
            }































            // //Si tiene carrito intentara agregar o actualizar el carrito
            // if(constCarritoDeCompra)
            // {
            //     //Buscara si el Socio de negocio tiene un carrito activo.
            //     var carrito_id = constCarritoDeCompra.dataValues.cdc_carrito_de_compra_id
            //     var producto_id = req.body.prod_producto_id

            //     //Valida si existe el producto en el carrito
            //     const constProductoCarritoDeCompra = await models.ProductoCarritoDeCompra.findOne(
            //     {
            //         where: {
            //             pcdc_prod_producto_id: producto_id,
            //             pcdc_carrito_de_compra_id: carrito_id
            //         }
            //     })

            //     //Si es carrito existe y el producto esta
            //     if(constProductoCarritoDeCompra)
            //     {
            //         //Actualizar la cantidad porque el ID del producto ya existe para ese carrito
            //         await constProductoCarritoDeCompra.destroy();

            //         //Retorna el id del carrito segun el id del SN
            //         res.status(200).send({
            //             message: 'Se elimino el articulo del carrito.'
            //         })
            //     }
            //     else
            //     {
            //         //El SKU/ID de producto no existe en los productos carrito
            //         res.status(200).send({
            //             message: 'El Socio de negocio no tiene este articulo en su carrito.'
            //         })
            //     }
            // }


            // //Else por si todavia no se a creado el carrito cosa que no deberia pasar.
            // else
            // {
            //     //Retornara el id del nuevo carrito
            //     res.status(200).send({
            //         message: 'El Socio de negocio no tiene un carrito asignado'
            //     })
            // }
        }
        catch(e){
            res.status(500).send({
                message: 'Error al agregar producto al carrito',
                e
            });
            next(e);
        }
    },


















    asignCoupon: async(req, res, next) =>{
        try{
            var socio_negocio_id = req.body.cdc_sn_socio_de_negocio_id
            var cupon_codigo = req.body.promcup_cupon_codigo
            var sn_valido = false


            //Buscar si el cupon existe o aplicable
            const constPromocionCupones = await models.PromocionCupones.findOne(
            {
                where: {
                    promcup_cupon_codigo: cupon_codigo,
                    promcup_estatus_id: statusControllers.ESTATUS_CUPONES.ACTIVO,
                    [Op.and]: [
                        Sequelize.literal("promcup_fecha_inicio_validez <= current_date and promcup_fecha_finalizacion_validez >= current_date"),
                    ]
                    // [Op.and]: [
                    //     Sequelize.literal("promcup_fecha_finalizacion_validez >= current_date"),
                    // ]
                }
            });

            console.log(constPromocionCupones)


            if(constPromocionCupones)
            {
                //Buscar si el cupon es aplicable
                const constElementosCupones = await models.ElementosCupones.findOne(
                {
                    where: {
                        ec_promcup_promociones_cupones_id: constPromocionCupones.dataValues.promcup_promociones_cupones_id,
                        ec_sn_socios_negocio_id: socio_negocio_id
                    }
                });

                if(constElementosCupones)
                {
                    
                    //Verificar cupon usado contra las compras finalizadas
                    const constCompraFinalizada = await models.CompraFinalizada.findOne(
                    {
                        where: {
                            cf_promcup_promociones_cupones_id: constPromocionCupones.promcup_promociones_cupones_id,
                            cf_vendido_a_socio_negocio_id: socio_negocio_id
                        }
                    });

                    if(constCompraFinalizada)
                    {
                        res.status(300).send({
                            message: 'Cupon ya a sido utilizado'
                        })
                    }
                    else
                    {
                        const constCarritoDeCompra = await models.CarritoDeCompra.findOne(
                        {
                            where: {
                                cdc_sn_socio_de_negocio_id: socio_negocio_id
                            }
                        });

                        if(constCarritoDeCompra)
                        {
                            await constCarritoDeCompra.update({
                                cdc_promcup_promociones_cupones_id: constPromocionCupones.promcup_promociones_cupones_id,
                                updatedAt: Date()
                            });



                            //tipo descuento
                            const constControlMaestroMultiple = await models.ControlMaestroMultiple.findOne(
                            {
                                where: {
                                    cmm_control_id: constPromocionCupones.promcup_tipo_descuento_id
                                }
                            })


                            res.status(200).send({
                                message: 'Asignado correctamente',
                                tipoDescuento: constControlMaestroMultiple.cmm_valor,
                                CantidadExacta: constPromocionCupones.promcup_descuento_exacto
                            })
                        }
                        else
                        {
                            res.status(300).send({
                                message: 'Carrito no encontrado'
                            })
                        }
                    }

                }
                else
                {
                    res.status(300).send({
                        message: 'Cupon no existe o no aplica'
                    })
                }
  
            }
            else
            {       
                res.status(300).send({
                    message: 'Cupon no existe'
                })
            }
        }
        catch(e){
            res.status(500).send({
                message: 'Error al asignar cupon al carrito',
                e
            });
            next(e);
        }
    },

    asignReference: async(req, res, next) =>{
        try{
            var socio_negocio_id = req.body.cdc_sn_socio_de_negocio_id
            var referencia = req.body.cdc_referencia


            const constCarritoDeCompra = await models.CarritoDeCompra.findOne(
            {
                where: {
                    cdc_sn_socio_de_negocio_id: socio_negocio_id
                }
            });


            await constCarritoDeCompra.update({
                cdc_referencia: referencia,
                updatedAt: Date()
            });

            res.status(200).send({
                message: 'Referencia Actualizada'
            })

        }
        catch(e){
            res.status(500).send({
                message: 'Error al asignar cupon al carrito',
                e
            });
            next(e);
        }
    },

    asignCFDI: async(req, res, next) =>{
        try{
            var socio_negocio_id = req.body.cdc_sn_socio_de_negocio_id

            const constCarritoDeCompra = await models.CarritoDeCompra.findOne(
            {
                where: {
                    cdc_sn_socio_de_negocio_id: socio_negocio_id
                }
            });

            await constCarritoDeCompra.update({
                cdc_cfdi: req.body.cdc_cfdi,
                updatedAt: Date()
            });

            res.status(200).send({
                message: 'CFDI Actualizada'
            })

        }
        catch(e){
            res.status(500).send({
                message: 'Error al asignar cupon al carrito',
                e
            });
            next(e);
        }
    },

    deleteCouponOnCart: async(req, res, next) =>{
        try{

            var socio_negocio_id = req.body.cdc_sn_socio_de_negocio_id

            const constCarritoDeCompra = await models.CarritoDeCompra.findOne(
            {
                where: {
                    cdc_sn_socio_de_negocio_id: socio_negocio_id
                }
            });

            if(constCarritoDeCompra)
            {
                await constCarritoDeCompra.update({
                    cdc_promcup_promociones_cupones_id: null,
                    updatedAt: Date()
                });

                res.status(200).send({
                    message: 'Cupon borrado con exito'
                })
            }
            else
            {
                res.status(200).send({
                    message: 'Carrito no encontrado'
                })
            }

        }
        catch(e){
            res.status(500).send({
                message: 'Error al quitar cupon del carrito',
                e
            });
            next(e);
        }
    },

    setCartShippingDetail: async(req, res, next) =>{
        try{
            //Borrara todos los metodos de envio al modificar cantidades de productos
            var borrarEnvioBool = await productosUtils.EraseShippingMethod(req.body.cdc_sn_socio_de_negocio_id);

            var cdc_sn_socio_de_negocio_id = req.body.cdc_sn_socio_de_negocio_id
            var cdc_cmm_tipo_envio_id = req.body.cdc_cmm_tipo_envio_id
            var cdc_direccion_envio_id = req.body.cdc_direccion_envio_id
            var cdc_alm_almacen_recoleccion = req.body.cdc_alm_almacen_recoleccion
            var cdc_fletera_id = req.body.cdc_fletera_id


            //obtener tipo impuesto cmm
            const constControlMaestroMultiple = await models.ControlMaestroMultiple.findOne(
            {
                where: {
                    cmm_control_id: cdc_cmm_tipo_envio_id
                }
            })

            //Envio a domicilio si el ID es 16 de tipo envio
            if(constControlMaestroMultiple.cmm_valor == "Envío domicilio")
            {
                //usara la function de cotizador
                var checkoutJson = await getCheckout.getCheckoutAPI(req.body.cdc_sn_socio_de_negocio_id);
                var CotizacionResult = await cotizarCarritoFunction.CotizarCarritoFunction(cdc_sn_socio_de_negocio_id, cdc_cmm_tipo_envio_id, cdc_direccion_envio_id, cdc_alm_almacen_recoleccion, cdc_fletera_id, checkoutJson);



                console.log(CotizacionResult)
                if(CotizacionResult.totalFinal == 0 || CotizacionResult.totalFinal > 0)
                {
                    console.log(55554444)
                    //buscar carrito para actualizar
                    const constCarritoDeCompra = await models.CarritoDeCompra.findOne(
                    {
                        where: {
                            cdc_sn_socio_de_negocio_id: cdc_sn_socio_de_negocio_id
                        }
                    });

                    //Actualizar carrito
                    await constCarritoDeCompra.update({
                        cdc_cmm_tipo_envio_id: cdc_cmm_tipo_envio_id,
                        cdc_direccion_envio_id: cdc_direccion_envio_id,
                        cdc_alm_almacen_recoleccion: cdc_alm_almacen_recoleccion,
                        cdc_fletera_id: CotizacionResult.fleteraID,
                        cdc_costo_envio: CotizacionResult.totalFinal,
                        cdc_politica_envio_activa: CotizacionResult.politicaBool,
                        cdc_politica_envio_nombre: CotizacionResult.politicaNombre,
                        cdc_politica_envio_surtir_un_solo_almacen: CotizacionResult.suertirUnSoloAlmacen,
                        updatedAt: Date()
                    });

                    //buscar carrito para actualizar
                    const constFleteras = await models.Fleteras.findOne(
                    {
                        where: {
                            flet_fletera_id: CotizacionResult.fleteraID
                        }
                    });

                    if(constFleteras)
                    {
                        res.status(200).send({
                            message: 'Cotizado con exito',
                            fleteraID: CotizacionResult.fleteraID,
                            fleteraNombre: constFleteras.flet_nombre,
                            costoEnvio: CotizacionResult.totalFinal
                        })
                    }
                    else
                    {
                        res.status(200).send({
                            message: 'Cotizado con exito',
                            fleteraID: CotizacionResult.fleteraID,
                            fleteraNombre: "Nombre no disponible",
                            costoEnvio: CotizacionResult.totalFinal
                        })
                    }

                    
                }
                else
                {
                    console.log(999998888877777)
                    //buscar carrito para actualizar
                    const constCarritoDeCompra = await models.CarritoDeCompra.findOne(
                    {
                        where: {
                            cdc_sn_socio_de_negocio_id: cdc_sn_socio_de_negocio_id
                        }
                    });

                    //Actualizar carrito
                    await constCarritoDeCompra.update({
                        cdc_cmm_tipo_envio_id: null,
                        cdc_direccion_envio_id: null,
                        cdc_alm_almacen_recoleccion: null,
                        cdc_fletera_id: null,
                        cdc_costo_envio: null,
                        cdc_politica_envio_activa: false,
                        cdc_politica_envio_nombre: null,
                        cdc_politica_envio_surtir_un_solo_almacen: false,
                        updatedAt: Date()
                    });

                    res.status(500).send({
                        message: 'No fue posible obtener el costo de envio',
                        e: CotizacionResult
                    })
                }
            }



            //Si el tipo de envio es 17 es recoleccion
            else if(constControlMaestroMultiple.cmm_valor == "Recolección")
            {
                //buscar carrito para actualizar
                const constCarritoDeCompra = await models.CarritoDeCompra.findOne(
                {
                    where: {
                        cdc_sn_socio_de_negocio_id: cdc_sn_socio_de_negocio_id
                    }
                });

                var fleteraRecoleccion
                if(cdc_alm_almacen_recoleccion == 1)
                {
                    fleteraRecoleccion = 8
                }
                else
                {
                    fleteraRecoleccion = 9
                }


                //Actualizar carrito
                await constCarritoDeCompra.update({
                    cdc_cmm_tipo_envio_id: cdc_cmm_tipo_envio_id,
                    cdc_direccion_envio_id: null,
                    cdc_alm_almacen_recoleccion: cdc_alm_almacen_recoleccion,
                    cdc_fletera_id: fleteraRecoleccion,
                    cdc_costo_envio: 0,
                    cdc_politica_envio_activa: false,
                    cdc_politica_envio_nombre: null,
                    updatedAt: Date()
                });


                res.status(200).send({
                    message: 'Cotizado con exito',
                    costoEnvio: 0
                })
            }


        }
        catch(e){
            res.status(500).send({
                message: 'error al cotizar y actualizar carrito',
                e
            });
            next(e);
        }
    },

    setCartTipoCompra: async(req, res, next) =>{
        try{

            var cdc_sn_socio_de_negocio_id = req.body.cdc_sn_socio_de_negocio_id
            var sfp_sap_formas_pago_id = req.body.sfp_sap_formas_pago_id
           
            //buscar carrito para actualizar
            const constCarritoDeCompra = await models.CarritoDeCompra.findOne(
            {
                where: {
                    cdc_sn_socio_de_negocio_id: cdc_sn_socio_de_negocio_id
                }
            });


            //buscar carrito para actualizar
            const constSapFormasPago = await models.SapFormasPago.findOne(
            {
                where: {
                    sfp_sap_formas_pago_id: sfp_sap_formas_pago_id
                }
            });

            //Actualizar carrito
            await constCarritoDeCompra.update({
                cdc_forma_pago_codigo: constSapFormasPago.sfp_clave,
                updatedAt: Date()
            });

            res.status(200).send({
                message: 'Se actualizo correctamente'
            })

        }
        catch(e){
            res.status(500).send({
                message: 'error al actualizar',
                e
            });
            next(e);
        }
    },




    getV2Checkout: async(req, res, next) =>{
        try{
            var checkoutJson = await getCheckout.getCheckoutAPI(req.body.cdc_sn_socio_de_negocio_id);

            checkoutJson.dataValues.productos = await getCheckout.removerLineasCantidadCeroDeStockInactivo(checkoutJson.dataValues.productos);


            res.status(200).send({
                message: 'Checkout Obtenido',
                cdc_carrito_de_compra_id: checkoutJson
            })
        }
        catch(e){
            res.status(500).send({
                message: 'Error al obtener Checkout',
                e
            });
            next(e);
        }
    },






    prevalidarCarrito: async(req, res, next) =>{
        try{
            var cdc_sn_socio_de_negocio_id = req.body.cdc_sn_socio_de_negocio_id

            //Obtener carrito
            const constCarritoDeCompra = await models.CarritoDeCompra.findOne(
            {
                where: {
                    cdc_sn_socio_de_negocio_id: cdc_sn_socio_de_negocio_id
                }
            });

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
            });

            var checkoutJson = await getCheckout.getCheckoutAPI(req.body.cdc_sn_socio_de_negocio_id);

            //obtener tipo impuesto cmm
            const constControlMaestroMultiple = await models.ControlMaestroMultiple.findOne(
            {
                where: {
                    cmm_valor: checkoutJson.dataValues.tipoImpuesto
                }
            });




            var cuentaConFormaDePago = false

            if(constCarritoDeCompra.dataValues.cdc_forma_pago_codigo != null)
            {
                cuentaConFormaDePago = true
            }




            //Validar si hay stock en los productos o aplican back orden
            var boolValidarStock = await getCheckout.validarStockCarrito(constProductoCarritoDeCompra);

            //Validar si hay stock en los productos o aplican back orden
            var boolValidarDimensiones = await cotizarCarritoFunction.validarDimensionesCarritoProducto(constProductoCarritoDeCompra);



            if(cuentaConFormaDePago == true)
            {
                if(boolValidarStock == true)
                {
                    if(boolValidarDimensiones == true)
                    {
                        var existeEmail = true

                        //validar email de facturacion para conekta
                        const constSociosNegocio = await models.SociosNegocio.findOne({
                            where: {
                                sn_socios_negocio_id: cdc_sn_socio_de_negocio_id
                            }
                        });

                        if(constSociosNegocio.sn_email_facturacion == null || constSociosNegocio.sn_email_facturacion == '')
                        {
                            existeEmail = false
                        }


                        if(existeEmail == false)
                        {
                            //validar email de facturacion para conekta
                            const constSociosNegocioUsuario = await models.SociosNegocioUsuario.findOne({
                                where: {
                                    snu_cardcode: constSociosNegocio.sn_cardcode,
                                    snu_super_usuario: true
                                }
                            });

                            if(constSociosNegocioUsuario)
                            {
                                if(constSociosNegocioUsuario.snu_correo_electronico != '' && constSociosNegocioUsuario.snu_correo_electronico != null)
                                {
                                    existeEmail = true
                                }
                            }
                        }

                        






                        if(existeEmail == true)
                        {
                            //Crear compra finalizada en tabla preValidadora
                            const constPreCompraFinalizada = await models.PreCompraFinalizada.create({
                                cf_compra_numero_orden: constCarritoDeCompra.cdc_numero_orden,
                                cf_compra_fecha: Date(),
                                cf_vendido_por_usu_usuario_id: /*!!req.body.cf_vendido_por_usu_usuario_id ? req.body.cf_vendido_por_usu_usuario_id : null,*/ null,
                                cf_cmm_tipo_compra_id: null, //no aplica, porque existe el campo forma de pago
                                cf_vendido_a_socio_negocio_id: constCarritoDeCompra.cdc_sn_socio_de_negocio_id,
                                cf_cmm_tipo_envio_id: constCarritoDeCompra.cdc_cmm_tipo_envio_id, 
                                cf_direccion_envio_id: constCarritoDeCompra.cdc_direccion_envio_id,
                                cf_cmm_tipo_impuesto: constControlMaestroMultiple.cmm_control_id, 
                                cf_alm_almacen_recoleccion: constCarritoDeCompra.cdc_alm_almacen_recoleccion,
                                cf_total_compra: checkoutJson.dataValues.TotalFinal,
                                cf_estatus_orden: 1000107,
                                cf_fletera_id: constCarritoDeCompra.cdc_fletera_id,
                                cf_sap_metodos_pago_codigo: /*!!req.body.cdc_forma_pago_codigo ? req.body.cdc_forma_pago_codigo : null,*/ "PUE", //pago unico
                                cf_sap_forma_pago_codigo: constCarritoDeCompra.cdc_forma_pago_codigo ? constCarritoDeCompra.cdc_forma_pago_codigo : null,
                                cf_estatus_creacion_sap: null,
                                cf_descripcion_sap: null,
                                cf_referencia: null,
                                cf_promcup_promociones_cupones_id: constCarritoDeCompra.cdc_promcup_promociones_cupones_id,
                                cf_cfdi: constCarritoDeCompra.cdc_cfdi
                            });

                            if(constPreCompraFinalizada)
                            {
                                //Obtener Lineas para insertar en la tabla productos compra finalizada y para sap
                                var lineasTemporales = await getCheckout.getLineasProductosComprasFinalizadas(checkoutJson, constPreCompraFinalizada.dataValues.cf_compra_finalizada_id);

                                //Insertar cada producto en la tabla de productos compras finalizadas
                                for (var i = 0; i < lineasTemporales.length; i++) 
                                {
                                    await models.PreProductoCompraFinalizada.create(lineasTemporales[i]);
                                }

                                //Validar el json de sap
                                var validarOrdenSAP = await CreacionOrdenSAP.preValidarCreacionOrdenSAP(req.body.cdc_sn_socio_de_negocio_id, constPreCompraFinalizada.dataValues.cf_compra_finalizada_id);

                                //Eliminar todo lo insertado en la tabla prevalidadora
                                var DeleteAll = `
                                    delete from pre_productos_de_compra_finalizada
                                `;

                                await sequelize.query(DeleteAll,
                                { 
                                    type: sequelize.QueryTypes.SELECT 
                                });


                                var DeleteAll2 = `
                                    delete from pre_compras_finalizadas
                                `;

                                await sequelize.query(DeleteAll2,
                                { 
                                    type: sequelize.QueryTypes.SELECT 
                                });


                                if(validarOrdenSAP.status == true)
                                {
                                    res.status(200).send({
                                        message: 'Prevalidar Inserciones OK'
                                    })
                                }
                                else
                                {
                                    res.status(validarOrdenSAP.codigoStatus).send({
                                        data: validarOrdenSAP
                                    })
                                }
                            }  
                            else
                            {
                                res.status(500).send({
                                    message: 'Fallo al prevalidad insertar la orden'
                                })
                            }

                        }
                        else
                        {
                            res.status(500).send({
                                message: 'El usuario no cuenta con Email de facturacion'
                            })
                        }
                    }
                    else
                    {
                        res.status(500).send({
                            message: 'Uno o mas articulos no pueden ser cotizados para envio'
                        })
                    }
                }
                else
                {
                    res.status(500).send({
                        message: 'Uno o mas Articulos no cuentan con suficiente stock'
                    })
                }
            }
            else
            {
                res.status(500).send({
                    message: 'El carrito no cuenta con una forma de pago'
                })
            }

            
        }
        catch(e){
            //Eliminar todo lo insertado en la tabla prevalidadora
                var DeleteAll = `
                    delete from pre_productos_de_compra_finalizada
                `;

                await sequelize.query(DeleteAll,
                { 
                    type: sequelize.QueryTypes.SELECT 
                });


                var DeleteAll2 = `
                    delete from pre_compras_finalizadas
                `;

                await sequelize.query(DeleteAll2,
                { 
                    type: sequelize.QueryTypes.SELECT 
                });


            res.status(500).send({
                message: 'Error',
                e
            });
            next(e);
        }
    },

    prevalidarCarritoSinStock: async(req, res, next) =>{
        try{
            var cdc_sn_socio_de_negocio_id = req.body.cdc_sn_socio_de_negocio_id

            //Obtener carrito
            const constCarritoDeCompra = await models.CarritoDeCompra.findOne(
            {
                where: {
                    cdc_sn_socio_de_negocio_id: cdc_sn_socio_de_negocio_id
                }
            });

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
            });

            var checkoutJson = await getCheckout.getCheckoutAPI(req.body.cdc_sn_socio_de_negocio_id);

            //obtener tipo impuesto cmm
            const constControlMaestroMultiple = await models.ControlMaestroMultiple.findOne(
            {
                where: {
                    cmm_valor: checkoutJson.dataValues.tipoImpuesto
                }
            });




            var cuentaConFormaDePago = false

            if(constCarritoDeCompra.dataValues.cdc_forma_pago_codigo != null)
            {
                cuentaConFormaDePago = true
            }




            //Validar si hay stock en los productos o aplican back orden
            var boolValidarDimensiones = await cotizarCarritoFunction.validarDimensionesCarritoProducto(constProductoCarritoDeCompra);



            if(cuentaConFormaDePago == true)
            {
                if(boolValidarDimensiones == true)
                {
                    var existeEmail = true

                    //validar email de facturacion para conekta
                    const constSociosNegocio = await models.SociosNegocio.findOne({
                        where: {
                            sn_socios_negocio_id: cdc_sn_socio_de_negocio_id
                        }
                    });

                    if(constSociosNegocio.sn_email_facturacion == null || constSociosNegocio.sn_email_facturacion == '')
                    {
                        existeEmail = false
                    }


                    if(existeEmail == false)
                    {
                        //validar email de facturacion para conekta
                        const constSociosNegocioUsuario = await models.SociosNegocioUsuario.findOne({
                            where: {
                                snu_cardcode: constSociosNegocio.sn_cardcode,
                                snu_super_usuario: true
                            }
                        });

                        if(constSociosNegocioUsuario)
                        {
                            if(constSociosNegocioUsuario.snu_correo_electronico != '' && constSociosNegocioUsuario.snu_correo_electronico != null)
                            {
                                existeEmail = true
                            }
                        }
                    }

                    






                    if(existeEmail == true)
                    {
                        //Crear compra finalizada en tabla preValidadora
                        const constPreCompraFinalizada = await models.PreCompraFinalizada.create({
                            cf_compra_numero_orden: constCarritoDeCompra.cdc_numero_orden,
                            cf_compra_fecha: Date(),
                            cf_vendido_por_usu_usuario_id: /*!!req.body.cf_vendido_por_usu_usuario_id ? req.body.cf_vendido_por_usu_usuario_id : null,*/ null,
                            cf_cmm_tipo_compra_id: null, //no aplica, porque existe el campo forma de pago
                            cf_vendido_a_socio_negocio_id: constCarritoDeCompra.cdc_sn_socio_de_negocio_id,
                            cf_cmm_tipo_envio_id: constCarritoDeCompra.cdc_cmm_tipo_envio_id, 
                            cf_direccion_envio_id: constCarritoDeCompra.cdc_direccion_envio_id,
                            cf_cmm_tipo_impuesto: constControlMaestroMultiple.cmm_control_id, 
                            cf_alm_almacen_recoleccion: constCarritoDeCompra.cdc_alm_almacen_recoleccion,
                            cf_total_compra: checkoutJson.dataValues.TotalFinal,
                            cf_estatus_orden: 1000107,
                            cf_fletera_id: constCarritoDeCompra.cdc_fletera_id,
                            cf_sap_metodos_pago_codigo: /*!!req.body.cdc_forma_pago_codigo ? req.body.cdc_forma_pago_codigo : null,*/ "PUE", //pago unico
                            cf_sap_forma_pago_codigo: constCarritoDeCompra.cdc_forma_pago_codigo ? constCarritoDeCompra.cdc_forma_pago_codigo : null,
                            cf_estatus_creacion_sap: null,
                            cf_descripcion_sap: null,
                            cf_referencia: null,
                            cf_promcup_promociones_cupones_id: constCarritoDeCompra.cdc_promcup_promociones_cupones_id,
                            cf_cfdi: constCarritoDeCompra.cdc_cfdi
                        });

                        if(constPreCompraFinalizada)
                        {
                            //Obtener Lineas para insertar en la tabla productos compra finalizada y para sap
                            var lineasTemporales = await getCheckout.getLineasProductosComprasFinalizadas(checkoutJson, constPreCompraFinalizada.dataValues.cf_compra_finalizada_id);

                            //Insertar cada producto en la tabla de productos compras finalizadas
                            for (var i = 0; i < lineasTemporales.length; i++) 
                            {
                                await models.PreProductoCompraFinalizada.create(lineasTemporales[i]);
                            }

                            //Validar el json de sap
                            var validarOrdenSAP = await CreacionOrdenSAP.preValidarCreacionOrdenSAP(req.body.cdc_sn_socio_de_negocio_id, constPreCompraFinalizada.dataValues.cf_compra_finalizada_id);

                            //Eliminar todo lo insertado en la tabla prevalidadora
                            var DeleteAll = `
                                delete from pre_productos_de_compra_finalizada
                            `;

                            await sequelize.query(DeleteAll,
                            { 
                                type: sequelize.QueryTypes.SELECT 
                            });


                            var DeleteAll2 = `
                                delete from pre_compras_finalizadas
                            `;

                            await sequelize.query(DeleteAll2,
                            { 
                                type: sequelize.QueryTypes.SELECT 
                            });


                            if(validarOrdenSAP.status == true)
                            {
                                res.status(200).send({
                                    message: 'Prevalidar Inserciones OK'
                                })
                            }
                            else
                            {
                                res.status(validarOrdenSAP.codigoStatus).send({
                                    data: validarOrdenSAP
                                })
                            }
                        }  
                        else
                        {
                            res.status(500).send({
                                message: 'Fallo al prevalidad insertar la orden'
                            })
                        }

                    }
                    else
                    {
                        res.status(500).send({
                            message: 'El usuario no cuenta con Email de facturacion'
                        })
                    }
                }
                else
                {
                    res.status(500).send({
                        message: 'Uno o mas articulos no pueden ser cotizados para envio'
                    })
                }
            }
            else
            {
                res.status(500).send({
                    message: 'El carrito no cuenta con una forma de pago'
                })
            }

            
        }
        catch(e){
            //Eliminar todo lo insertado en la tabla prevalidadora
                var DeleteAll = `
                    delete from pre_productos_de_compra_finalizada
                `;

                await sequelize.query(DeleteAll,
                { 
                    type: sequelize.QueryTypes.SELECT 
                });


                var DeleteAll2 = `
                    delete from pre_compras_finalizadas
                `;

                await sequelize.query(DeleteAll2,
                { 
                    type: sequelize.QueryTypes.SELECT 
                });


            res.status(500).send({
                message: 'Error',
                e
            });
            next(e);
        }
    },




















    getPreOrdenDividida: async(req, res, next) =>{
        try{
            var checkoutJson = await getCheckout.getCheckoutAPI(req.body.cdc_sn_socio_de_negocio_id);

            var lineasTemporales = await getCheckout.getLineasProductosComprasFinalizadas(checkoutJson, 1);

            console.log(lineasTemporales)

            for (var i = 0; i < lineasTemporales.length; i++) 
            {
                //Fecha de entrega informacion
                var dateFinal
                var day = new Date()

                var defined = false
                if(typeof(lineasTemporales[i].pcf_recoleccion_resurtimiento) !== 'undefined')
                {
                    defined = true
                }




                
                if(defined == true)
                {
                    console.log(1111111)
                    var dayLetters = date_and_time.format(day, "dddd")

                    var AddingsDays = 0
                    switch(dayLetters)
                    {
                        case "Monday":
                            AddingsDays = 9
                        break;

                        case "Tuesday":
                            AddingsDays = 8
                        break;

                        case "Wednesday":
                            AddingsDays = 7
                        break;

                        case "Thursday":
                            AddingsDays = 6
                        break;

                        case "Friday":
                            AddingsDays = 5
                        break;

                        case "Saturday":
                            AddingsDays = 4
                        break;

                        case "Sunday":
                            AddingsDays = 3
                        break;
                    }
                    var nuevoDia = date_and_time.addDays(day, (AddingsDays))
                    nuevoDia = date_and_time.addHours(nuevoDia, -5)

                    dateFinal = date_and_time.format(nuevoDia, "YYYY/MM/DD")
                }
                
                else if(lineasTemporales[i].pcf_dias_resurtimiento > 0)
                {
                    console.log(22222)
                    var nuevoDia = date_and_time.addDays(day, (lineasTemporales[i].pcf_dias_resurtimiento+1))
                    nuevoDia = date_and_time.addHours(nuevoDia, -5)

                    dateFinal = date_and_time.format(nuevoDia, "YYYY/MM/DD")
                }
                else if(checkoutJson.dataValues.cdc_politica_envio_surtir_un_solo_almacen == false && checkoutJson.dataValues.cdc_politica_envio_nombre != null)
                {
                    console.log(999999)
                    var dayLetters = date_and_time.format(day, "dddd")

                    var AddingsDays = 0
                    switch(dayLetters)
                    {
                        case "Monday":
                            AddingsDays = 9
                        break;

                        case "Tuesday":
                            AddingsDays = 8
                        break;

                        case "Wednesday":
                            AddingsDays = 7
                        break;

                        case "Thursday":
                            AddingsDays = 13
                        break;

                        case "Friday":
                            AddingsDays = 12
                        break;

                        case "Saturday":
                            AddingsDays = 11
                        break;

                        case "Sunday":
                            AddingsDays = 10
                        break;
                    }
                    var nuevoDia = date_and_time.addDays(day, (AddingsDays))
                    nuevoDia = date_and_time.addHours(nuevoDia, -5)

                    dateFinal = date_and_time.format(nuevoDia, "YYYY/MM/DD")
                }
                else
                {
                    console.log(333333)
                    var nuevoDia = date_and_time.addDays(day, 1)
                    nuevoDia = date_and_time.addHours(nuevoDia, -5)

                    dateFinal = date_and_time.format(nuevoDia, "YYYY/MM/DD")
                }


                lineasTemporales[i].dateFinal = dateFinal
            }

            res.status(200).send({
                message: 'get Pre Orden Dividida',
                getPreOrdenDividida: lineasTemporales
            })
        }
        catch(e){
            console.log(e)
            res.status(500).send({
                message: 'Error al obtener Checkout',
                e
            });
            next(e);
        }
    },


























    get_V2_checkout_resumen_MXN_USD: async(req, res, next) =>{
        try{
            // var checkoutJson = await getCheckout.getCheckoutAPI(req.body.cdc_sn_socio_de_negocio_id);

            // checkoutJson.dataValues.cdc_forma_pago_codigo
            
            // var jsonMXN = []
            // var jsonUSD = []


            // //Obtener tipo de cambio
            // const constTipoCambio = await models.ControlMaestroMultiple.findOne(
            // {
            //     where: {
            //         cmm_nombre: "TIPO_CAMBIO_USD"
            //     },
            //     attributes: ["cmm_valor"]
            // })
            // var USDValor = constTipoCambio.cmm_valor


            // var precioTotal = 0
            // var totalDescuentos = 0
            // var precioFinalTotal = 0
            // var cdc_costo_envio = 0
            // var TotalImpuesto = 0
            // var TotalFinal = 0


            // var precioTotal_usd = 0
            // var totalDescuentos_usd = 0
            // var precioFinalTotal_usd = 0
            // var cdc_costo_envio_usd = 0
            // var TotalImpuesto_usd = 0
            // var TotalFinal_usd = 0

            // var precioTotalTemp


            // for (var i = 0; i < checkoutJson.dataValues.productos.length; i++) 
            // {

            //     // console.log(checkoutJson.dataValues.productos.pcdc_producto_carrito_id)
            //     if(checkoutJson.dataValues.cdc_forma_pago_codigo == 99)
            //     {
            //         // if(prod_tipo_cambio_base)
            //         if(checkoutJson.dataValues.productos[i].dataValues.prod_tipo_cambio_base == "USD")
            //         {

            //             //Variable que saca el total subtotal (cantidad x precio base)
            //             precioTotalTemp = (checkoutJson.dataValues.productos[i].dataValues.pcdc_producto_cantidad * checkoutJson.dataValues.productos[i].dataValues.precioBaseFinal)/USDValor
            //             precioTotal_usd += precioTotalTemp

            //             //Calculara el total de descuentos
            //             totalDescuentos_usd += (checkoutJson.dataValues.productos[i].dataValues.pcdc_producto_cantidad * checkoutJson.dataValues.productos[i].dataValues.totalDescuento)/USDValor

            //         }
            //         else
            //         {
            //             //Variable que saca el total subtotal (cantidad x precio base)
            //             precioTotalTemp = checkoutJson.dataValues.productos[i].dataValues.pcdc_producto_cantidad * checkoutJson.dataValues.productos[i].dataValues.precioBaseFinal
            //             precioTotal += precioTotalTemp

            //             //Calculara el total de descuentos
            //             totalDescuentos += checkoutJson.dataValues.productos[i].dataValues.pcdc_producto_cantidad * checkoutJson.dataValues.productos[i].dataValues.totalDescuento
            //         }

            //     }
            //     else
            //     {
            //         //Variable que saca el total subtotal (cantidad x precio base)
            //         precioTotalTemp = checkoutJson.dataValues.productos[i].dataValues.pcdc_producto_cantidad * checkoutJson.dataValues.productos[i].dataValues.precioBaseFinal
            //         precioTotal += precioTotalTemp


            //         //Calculara el total de descuentos
            //         totalDescuentos += checkoutJson.dataValues.productos[i].dataValues.pcdc_producto_cantidad * checkoutJson.dataValues.productos[i].dataValues.totalDescuento
            //     }
            // }


            // precioFinalTotal_usd += precioTotal_usd-totalDescuentos_usd
            // var cantidadImpuesto
            // if(checkoutJson.dataValues.tipoImpuesto == "16%")
            // {
            //     cantidadImpuesto = 16/100
            // }   
            // else
            // {
            //     cantidadImpuesto = 8/100
            // }

            // console.log(cantidadImpuesto)

            // TotalImpuesto_usd = parseFloat(((precioFinalTotal_usd)*cantidadImpuesto).toFixed(2))
            // TotalFinal_usd = parseFloat((precioFinalTotal_usd+TotalImpuesto_usd).toFixed(2))


            // var jsonArrayUSD = {
            //     "precioTotal_usd": precioTotal_usd,
            //     "totalDescuentos_usd": totalDescuentos_usd,
            //     "precioFinalTotal_usd": precioFinalTotal_usd,
            //     "cdc_costo_envio_usd": cdc_costo_envio_usd,
            //     "TotalImpuesto_usd": TotalImpuesto_usd,
            //     "TotalFinal_usd": TotalFinal_usd
            // }







            // precioFinalTotal = precioTotal-totalDescuentos
            // cdc_costo_envio = checkoutJson.dataValues.cdc_costo_envio

            // TotalImpuesto = parseFloat(((precioFinalTotal+cdc_costo_envio)*cantidadImpuesto).toFixed(2))

            // TotalFinal = parseFloat(((precioFinalTotal+cdc_costo_envio)+TotalImpuesto).toFixed(2))

            // var jsonArray = {
            //     "precioTotal": precioTotal,
            //     "totalDescuentos": totalDescuentos,
            //     "precioFinalTotal": precioFinalTotal,
            //     "cdc_costo_envio": cdc_costo_envio,
            //     "TotalImpuesto": TotalImpuesto,
            //     "TotalFinal": TotalFinal
            // }


            var resumenDividido = await getCheckout.getCheckoutResumenDetalle(req.body.cdc_sn_socio_de_negocio_id);

            res.status(200).send({
                message: 'Resumenes Obtenidos',
                resume_USD: resumenDividido[0],
                resume_MXN: resumenDividido[1]
            })
        }
        catch(e){
            res.status(500).send({
                message: 'Error al obtener Checkout',
                e
            });
            next(e);
        }
    },

































    test: async(req, res, next) =>{
        try{


            // //Obtener compra finalizada 
            // const constProducto = await models.Producto.findOne({
            //     where: {
            //         cf_compra_finalizada_id: OrderID,
            //         cf_estatus_orden: { [Op.ne] : null }
            //     },
            //     order: [
            //         ['prod_producto_id', 'ASC']
            //     ],
            //     attributes: ["cf_sap_json_creacion"]
            // })

            // p1.prod_producto_id as "_id",









            // //Create BODY ELASTICSEARCH JSON
            //     //SQL que genera los productos correctos
            //     var SQLProductos = `
            //         select
                        
            //             p1.prod_producto_id,
            //             p1.prod_nombre,
            //             p1.prod_nombre_extranjero,
            //             p1.prod_sku,
            //             p1.prod_volumen,
            //             p1.prod_peso,
            //             p1.prod_descripcion,
            //             m1.mar_marca_id,
            //             m1.mar_nombre,
            //             m1.mar_abreviatura,
            //             m1.mar_cmm_estatus_id,
            //             c1.cat_cmm_estatus_id,
            //             c1.cat_nombre,
            //             cmm.cmm_valor,
            //             cmm2.cmm_valor as cat_cmm_valor
            //         from
            //             productos p1
            //             left join categorias c1 on cast(p1.prod_codigo_grupo as int) = c1.cat_categoria_id
            //             left join proveedores pv on p1.prod_proveedor_id = pv.prv_proveedores_id
            //             left join marcas m1 on cast(p1.prod_codigo_marca as int) = m1.mar_marca_id
            //             left join controles_maestros_multiples cmm on p1.prod_cmm_estatus_id = cmm.cmm_control_id
            //             left join controles_maestros_multiples cmm2 on c1.cat_cmm_estatus_id = cmm2.cmm_control_id
            //         where 
            //             p1.prod_cmm_estatus_id = 1000016
            //             and prod_prod_producto_padre_sku is not null
            //             and prod_volumen != 0
            //             and prod_peso != 0
            //             and cmm2.cmm_valor = 'ACTIVO'
            //         order by 
            //             prod_producto_id
            //     `;

            //     var constProductos = await sequelize.query(SQLProductos,
            //     {
            //         type: sequelize.QueryTypes.SELECT 
            //     });


                


            //     var JsonFinal = ''

            //     for (var i = 0; i < constProductos.length; i++) 
            //     {

            //         // var tempJson1 = 
            //         // {
            //         //     "index":
            //         //     {
            //         //         "_index": "productos_dielsa",
            //         //         "_id": constProductos[i].prod_producto_id
            //         //     }
            //         // }

            //         // JsonFinal += JSON.stringify(tempJson1) + "\n"
            //         // constProductos[i]._index = "productos_dielsa"

            //         JsonFinal += JSON.stringify(constProductos[i]) + "\n"

                    
            //         // JsonFinal.push(tempJson1)
            //         // JsonFinal.push(constProductos[i])
            //     }   


            //     // var JsonFinal2 = JSON.stringify(JsonFinal)






            //     await fs.writeFile("./productos.json", JsonFinal, function(err) {
            //         if(err) {
            //             return console.log(err);
            //         }
            //         console.log("The file was saved!");
            //     }); 
            // //Fin elastic













            // var options = {
            //     method: 'POST',
            //     url: 'http://localhost:9200/test/_doc',
            //     qs: {pretty: ''},
            //     headers: {'Content-Type': 'application/json'},
            //     body: {
            //         id: 1,
            //         title: 'iPhone 11',
            //         category: 'Mobile Phone',
            //         price: 123300,
            //         formatted_price: '$1233.00 USD',
            //         description: 'iPhone 11, 64 GB '
            //     },
            //     json: true
            // };

            // var result = await request(options, function (error, response) 
            // {
            //     if (error) throw new Error(error);
            // });


            // console.log(result)
            // var resultJson = JSON.parse(result);



            // var resultJson = "En tránsito (Parcialidad 2/3)"


            // console.log(resultJson.slice(0, 11))


            // var cdc_sn_socio_de_negocio_id = req.body.cdc_sn_socio_de_negocio_id
            // const orden_carrito = String(Date.now()) + String(!!cdc_sn_socio_de_negocio_id ? cdc_sn_socio_de_negocio_id : 0 ) + String(0);
            // const orden_carrito = String(Date.now())
            // const orden_carrito = Date.now()



            var constProducto = await models.Producto.findOne(
            {
                where: {
                    prod_producto_id: 13
                }
            });

            console.log(constProducto)


            for (var i = 0; i < productosForInt; i++) 
            {
                

            }


            constProducto.dataValues.es_backorder = false

            if(constProducto.prod_dias_resurtimiento > 0){
                constProducto.dataValues.es_backorder = true
                console.log("entro")
            }
            else
            {
                console.log("no entro")
            }



            res.status(200).send({
                message: 'test finalizado',
                constProducto
            });

            // var OrderID = 600

            // //Obtener compra finalizada 
            // const constCompraFinalizadaJsonCreadoMXN = await models.CompraFinalizada.findOne({
            //     where: {
            //         cf_compra_finalizada_id: OrderID,
            //         cf_estatus_orden: { [Op.ne] : null }
            //     },
            //     attributes: ["cf_sap_json_creacion"]
            // })

            // if(constCompraFinalizadaJsonCreadoMXN)
            // {
            //     var jsonMXN = JSON.parse(constCompraFinalizadaJsonCreadoMXN.dataValues.cf_sap_json_creacion)
            //     var jsonMXNLineas = jsonMXN.lineas


            //     //Quita del array la ultima linea si es SER00003 de envio
            //     for (var i = 0; i < jsonMXNLineas.length; i++) 
            //     {
            //         if(jsonMXNLineas[i].codigoArticulo == 'SER00003')
            //         {
            //             jsonMXNLineas.splice(i, 1)
            //         }
            //     }

            //     //buscar lineas y establecelas segun id producto, almacen, date, cantidad
            //     for (var i = 0; i < jsonMXNLineas.length; i++) 
            //     {
            //         console.log(jsonMXNLineas[i])

            //         //Obtener compra finalizada 
            //         const constProdTemp = await models.Producto.findOne({
            //             where: {
            //                 prod_sku: jsonMXNLineas[i].codigoArticulo,
            //             },
            //             attributes: ["prod_producto_id"]
            //         })

            //         // Si el producto existe
            //         if(constProdTemp)
            //         {

            //             var almacenTemp

            //             if(jsonMXNLineas[i].codigoAlmacen == '01')
            //             {
            //                 almacenTemp = "1"
            //             }
            //             else
            //             {
            //                 almacenTemp = "3"
            //             }


            //             var dateFromJSON = jsonMXNLineas[i].fechaEntrega
            //             var ano = dateFromJSON.slice(6, 10)
            //             var mes = dateFromJSON.slice(3, 5)
            //             var dia = dateFromJSON.slice(0, 2)
            //             var fechaCompleta = ano + "-" + mes + "-" + dia + " 05:00:00"


            //             var varLineaActualizarTemp = `
            //                 select 
            //                     * 
            //                 from
            //                     productos_de_compra_finalizada pldp 
            //                 where 
            //                     pcf_prod_producto_id = ` + constProdTemp.prod_producto_id + `
            //                     and pcf_cf_compra_finalizada_id = ` + OrderID + `
            //                     and pcf_cantidad_producto = ` + jsonMXNLineas[i].cantidad + `
            //                     and pcf_almacen_linea = '` + almacenTemp + `'
            //                     and pcf_order_dividida_sap = false
            //                     and pcf_fecha_entrega = '` + fechaCompleta + `'
            //             `;

            //             //OBTIENE LOS ELEMENTOS BUSCADOS
            //             const constLineaActualizarTemp = await sequelize.query(varLineaActualizarTemp,
            //             { 
            //                 type: sequelize.QueryTypes.SELECT 
            //             });

            //             const constProductoCompraFinalizadaTemp = await models.ProductoCompraFinalizada.findOne({
            //                 where: {
            //                     pcf_producto_compra_finalizada_id: constLineaActualizarTemp[0].pcf_producto_compra_finalizada_id
            //                 }
            //             })

            //             await constProductoCompraFinalizadaTemp.update({
            //                 pcf_linea_num_sap: i
            //             });

            //         }



            //     }

            // }

            










            // //Obtener compra finalizada 
            // const constCompraFinalizadaJsonCreadoUSD = await models.CompraFinalizada.findOne({
            //     where: {
            //         cf_compra_finalizada_id: OrderID,
            //         cf_estatus_orden_usd: { [Op.ne] : null }
            //     },
            //     attributes: ["cf_sap_json_creacion_usd"]
            // })


            // if(constCompraFinalizadaJsonCreadoUSD)
            // {
            //     var jsonUSD = JSON.parse(constCompraFinalizadaJsonCreadoUSD.dataValues.cf_sap_json_creacion_usd)
            //     var jsonUSDLineas = jsonUSD.lineas


            //     //Quita del array la ultima linea si es SER00003 de envio
            //     for (var i = 0; i < jsonUSDLineas.length; i++) 
            //     {
            //         if(jsonUSDLineas[i].codigoArticulo == 'SER00003')
            //         {
            //             jsonUSDLineas.splice(i, 1)
            //         }
            //     }

            //     //buscar lineas y establecelas segun id producto, almacen, date, cantidad
            //     for (var i = 0; i < jsonUSDLineas.length; i++) 
            //     {
            //         //Obtener compra finalizada 
            //         const constProdTemp = await models.Producto.findOne({
            //             where: {
            //                 prod_sku: jsonUSDLineas[i].codigoArticulo,
            //             },
            //             attributes: ["prod_producto_id"]
            //         })

            //         // Si el producto existe
            //         if(constProdTemp)
            //         {
            //             var almacenTemp
            //             if(jsonUSDLineas[i].codigoAlmacen == '01')
            //             {
            //                 almacenTemp = "1"
            //             }
            //             else
            //             {
            //                 almacenTemp = "3"
            //             }

            //             var dateFromJSON = jsonUSDLineas[i].fechaEntrega
            //             var ano = dateFromJSON.slice(6, 10)
            //             var mes = dateFromJSON.slice(3, 5)
            //             var dia = dateFromJSON.slice(0, 2)
            //             var fechaCompleta = ano + "-" + mes + "-" + dia + " 05:00:00"


            //             var varLineaActualizarTemp = `
            //                 select 
            //                     * 
            //                 from
            //                     productos_de_compra_finalizada pldp 
            //                 where 
            //                     pcf_prod_producto_id = ` + constProdTemp.prod_producto_id + `
            //                     and pcf_cf_compra_finalizada_id = ` + OrderID + `
            //                     and pcf_cantidad_producto = ` + jsonUSDLineas[i].cantidad + `
            //                     and pcf_almacen_linea = '` + almacenTemp + `'
            //                     and pcf_order_dividida_sap = true
            //                     and pcf_fecha_entrega = '` + fechaCompleta + `'
            //             `;

            //             //OBTIENE LOS ELEMENTOS BUSCADOS
            //             const constLineaActualizarTemp = await sequelize.query(varLineaActualizarTemp,
            //             { 
            //                 type: sequelize.QueryTypes.SELECT 
            //             });

            //             const constProductoCompraFinalizadaTemp = await models.ProductoCompraFinalizada.findOne({
            //                 where: {
            //                     pcf_producto_compra_finalizada_id: constLineaActualizarTemp[0].pcf_producto_compra_finalizada_id
            //                 }
            //             })

            //             await constProductoCompraFinalizadaTemp.update({
            //                 pcf_linea_num_sap: i
            //             });

            //         }



            //     }

            // }





            // var OrderID = 600


            // await ordenCreadaEmail(633);

            
            // //Obtener compra finalizada 
            // const constCompraFinalizadaJsonCreadoUSD = await models.CompraFinalizada.findOne({
            //     where: {
            //         cf_compra_finalizada_id: OrderID,
            //         cf_estatus_orden_usd: { [Op.ne] : null }
            //     },
            //     attributes: ["cf_sap_json_creacion_usd"]
            // })


            // if(constCompraFinalizadaJsonCreadoUSD)
            // {
            //     var jsonUSD = JSON.parse(constCompraFinalizadaJsonCreadoUSD.dataValues.cf_sap_json_creacion_usd)
            //     var jsonUSDLineas = jsonUSD.lineas


            //     var oJSON = sortJSON(jsonUSDLineas, 'precioUnitario', 'asc');

            //     //Quita del array la ultima linea si es SER00003 de envio
            //     for (var i = 0; i < oJSON.length; i++) 
            //     {
            //         console.log(oJSON[i])
            //     }

            //     // //buscar lineas y establecelas segun id producto, almacen, date, cantidad
            //     // for (var i = 0; i < jsonUSDLineas.length; i++) 
            //     // {
            //     //     //Obtener compra finalizada 
            //     //     const constProdTemp = await models.Producto.findOne({
            //     //         where: {
            //     //             prod_sku: jsonUSDLineas[i].codigoArticulo,
            //     //         },
            //     //         attributes: ["prod_producto_id"]
            //     //     })

            //     //     // Si el producto existe
            //     //     if(constProdTemp)
            //     //     {
            //     //         var almacenTemp
            //     //         if(jsonUSDLineas[i].codigoAlmacen == '01')
            //     //         {
            //     //             almacenTemp = "1"
            //     //         }
            //     //         else
            //     //         {
            //     //             almacenTemp = "3"
            //     //         }

            //     //         var dateFromJSON = jsonUSDLineas[i].fechaEntrega
            //     //         var ano = dateFromJSON.slice(6, 10)
            //     //         var mes = dateFromJSON.slice(3, 5)
            //     //         var dia = dateFromJSON.slice(0, 2)
            //     //         var fechaCompleta = ano + "-" + mes + "-" + dia + " 05:00:00"


            //     //         var varLineaActualizarTemp = `
            //     //             select 
            //     //                 * 
            //     //             from
            //     //                 productos_de_compra_finalizada pldp 
            //     //             where 
            //     //                 pcf_prod_producto_id = ` + constProdTemp.prod_producto_id + `
            //     //                 and pcf_cf_compra_finalizada_id = ` + OrderID + `
            //     //                 and pcf_cantidad_producto = ` + jsonUSDLineas[i].cantidad + `
            //     //                 and pcf_almacen_linea = '` + almacenTemp + `'
            //     //                 and pcf_order_dividida_sap = true
            //     //                 and pcf_fecha_entrega = '` + fechaCompleta + `'
            //     //         `;

            //     //         //OBTIENE LOS ELEMENTOS BUSCADOS
            //     //         const constLineaActualizarTemp = await sequelize.query(varLineaActualizarTemp,
            //     //         { 
            //     //             type: sequelize.QueryTypes.SELECT 
            //     //         });

            //     //         const constProductoCompraFinalizadaTemp = await models.ProductoCompraFinalizada.findOne({
            //     //             where: {
            //     //                 pcf_producto_compra_finalizada_id: constLineaActualizarTemp[0].pcf_producto_compra_finalizada_id
            //     //             }
            //     //         })

            //     //         await constProductoCompraFinalizadaTemp.update({
            //     //             pcf_linea_num_sap: i
            //     //         });

            //     //     }



            //     // }

            // }


            

            // var palabrabuscar = req.body.palabraBuscar.trim()
            // var palabraSeparada = palabrabuscar.replace(/ /g, " & ")

            


            // var whereString = `to_tsvector(p1.prod_nombre || ' ' ||p1.prod_descripcion || ' ' || p1.prod_nombre_extranjero || ' ' || p1.prod_sku) 
            // @@ to_tsquery('`+palabraSeparada+`')`
            
            // console.log(whereString)

































            // var cf_compra_finalizada_id = req.body.cf_compra_finalizada_id
            // var checkoutJson = await CreacionOrdenSAP.preValidarCreacionOrdenSAP(req.body.cdc_sn_socio_de_negocio_id, cf_compra_finalizada_id);




            // var d = new Date();

            // var asd = new Date();

            // asd.setDate(res.getDate() + 2);
            // console.log(asd)

            // var a = addDaysToDate(tmpDate, 2)
            // var dia = d.getDate();
            // var mes = d.getMonth() + 1;
            // var año = d.getYear() + 1900;

            // if(mes < 10)
            // {
            //     mes = "0"+mes;
            // }
            // if(dia < 10)
            // {
            //     dia = "0"+dia;
            // }

            // var fechaTotal = año.toString()+mes.toString()+dia.toString();











            // var date = new Date()


            // // var nuevoDia = date_and_time.addDays(day, 11)
            // // nuevoDia = date_and_time.addHours(nuevoDia, 6)


            // var nuevoDia = date_and_time.addHours(date, -6)
            // // nuevoDia = date_and_time.addHours(nuevoDia, 6)
            // console.log(nuevoDia)





            // var newFormat = date_and_time.format(nuevoDia, "DD/MM/YYYY HH:mm:ss")


            // console.log(day)
            // console.log(nuevoDia)
            // console.log(newFormat)


            // var d = new Date("2020-04-13T00:00:00.000+08:00"); /* midnight in China on April 13th */
            // d.toLocaleString('en-US', { timeZone: 'America/New_York' });


            // console.log(d)








            // var date = new Date();
            // date.toString() // "Wed Jun 29 2011 09:52:48 GMT-0700 (PDT)"





            // const now = new Date();
            // console.log(date_and_time.format(now, 'YYYY/MM/DD HH:mm:ss'))    // => '2015/01/02 23:14:05'
            // console.log(date_and_time.format(now, 'ddd, MMM DD YYYY'))       // => 'Fri, Jan 02 2015'
            // console.log(date_and_time.format(now, 'hh:mm A [GMT]Z'))         // => '11:14 PM GMT-0800'
            // console.log(date_and_time.format(now, 'hh:mm A [GMT]Z', true))   // => '07:14 AM GMT+0000'


            

            // console.log(date_and_time.formatTZ(now, "America/Los_Angeles"))






            // const now = new Date();
            // const six_hour_ago = date_and_time.addHours(now, -5);
            // var anio = date_and_time.format(six_hour_ago, 'YYYY')
            // var mes = date_and_time.format(six_hour_ago, 'MM')
            // var dia = date_and_time.format(six_hour_ago, 'DD')
            // var totalraw = date_and_time.format(six_hour_ago, 'YYYYMMDD')

            // var totalFecha = anio+mes+dia

            // console.log(now)
            // console.log(six_hour_ago)
            // console.log(totalraw)
            // console.log(totalFecha)



            // res.status(200).send({
            //     message: "res"
            // })




            // var d = new Date();
            // d.setDate(d.getDate() + (((1 + 7 - d.getDay()) % 7) || 7));
            // console.log(d);




            // var day = new Date();
            // day = date_and_time.addDays(day, 4)


            // var dayLetters = date_and_time.format(day, "dddd")
            // console.log(dayLetters)



            // var AddingsDays = 0
            // switch(dayLetters)
            // {
            //     case "Monday":
            //         AddingsDays = 2
            //     break;

            //     case "Tuesday":
            //         AddingsDays = 1
            //     break;

            //     case "Wednesday":
            //         AddingsDays = 7
            //     break;

            //     case "Thursday":
            //         AddingsDays = 6
            //     break;

            //     case "Friday":
            //         AddingsDays = 5
            //     break;

            //     case "Saturday":
            //         AddingsDays = 4
            //     break;

            //     case "Sunday":
            //         AddingsDays = 3
            //     break;
            // }

            // console.log("dias agregados: " + AddingsDays)

            // var nuevoDia = date_and_time.addDays(day, (AddingsDays))
            // nuevoDia = date_and_time.addHours(nuevoDia, -5)

            // var dateFinal = date_and_time.format(nuevoDia, "DD/MM/YYYY HH:mm:ss")

            // console.log(nuevoDia)
            //var lineaNum = await CreacionOrdenSAP.CreaLineasNumSAP(395);









            // await ordenCreadaEmail(usuarioSolicitud.dataValues.snu_correo_electronico, tokenReturn, usuarioSolicitud.dataValues.snu_usuario_snu_id);
            // await ordenCreadaEmail(420);
            // await ordenAbiertaCreadaEmail(446);





























            // var order_id = 419

            // const constProductoCompraFinalizada= await models.ProductoCompraFinalizada.findAll({
            //     where: {
            //         pcf_cf_compra_finalizada_id: order_id
            //     },
            //     order: [
            //         ['pcf_fecha_entrega', 'ASC']
            //     ],
            //     attributes: ["pcf_prod_producto_id", "pcf_fecha_entrega", "pcf_cantidad_producto", "pcf_precio"]
            // })

            // var fecha_actual
            // for (var x = 0; x < constProductoCompraFinalizada.length; x++) 
            // {
            //     const constProducto = await models.Producto.findOne({
            //         where: {
            //             prod_producto_id: constProductoCompraFinalizada[x].dataValues.pcf_prod_producto_id
            //         },
            //         attributes: ["prod_nombre", "prod_nombre_extranjero"]
            //     })



            //     const constImagenProducto = await models.ImagenProducto.findOne({
            //         where: {
            //             imgprod_prod_producto_id: constProductoCompraFinalizada[x].dataValues.pcf_prod_producto_id
            //         },
            //         order: [
            //             ['imgprod_nombre_archivo', 'ASC']
            //         ]
            //     })


            //     var imagen
            //     var prod_nombre = constProducto.prod_nombre
            //     var prod_nombre_foraneo = constProducto.prod_nombre_extranjero
            //     var cantidad = constProductoCompraFinalizada[x].dataValues.pcf_cantidad_producto
            //     var precio = constProductoCompraFinalizada[x].dataValues.pcf_precio


                
            //     if(constImagenProducto)
            //     {
            //         imagen = constImagenProducto.imgprod_ruta_archivo
            //         imagen = imagen.split("./public")
            //         imagen = imagen[1]
            //         imagen = process.env.BACK_LINK + imagen
            //     }
            //     else
            //     {
            //         imagen = "http://wws.com.pa/wp-content/plugins/wordpress-ecommerce/marketpress-includes/images/default-product.png"
            //     }





            //     var fecha_temp = date_and_time.format(constProductoCompraFinalizada[x].dataValues.pcf_fecha_entrega, 'YYYY/MM/DD');

            //     //Para hacer tabla de productos y envios
            //     if(fecha_actual == fecha_temp)
            //     {
            //         console.log(constProductoCompraFinalizada[x].dataValues.pcf_prod_producto_id)
            //     }
            //     else
            //     {
            //         fecha_actual = fecha_temp



            //         if(x != 0)
            //         {
            //             console.log("-------------------------------------")
            //         }
            //         console.log("enviado el " + fecha_temp)
            //         console.log(constProductoCompraFinalizada[x].dataValues.pcf_prod_producto_id)


            //         console.log(imagen)
            //         console.log(prod_nombre)
            //         console.log(prod_nombre_foraneo)
            //         console.log(cantidad)
            //         console.log(precio)

            //     }
            // }












            


            


        }
        catch(e){
            console.log(e)
            res.status(500).send({
                message: 'Error al obtener Checkout',
                e
            });
            next(e);
        }
    },



    



    
}