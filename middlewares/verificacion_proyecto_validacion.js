import models from '../models';

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

exports.add_product_valid  = async function(carrito_id, producto_id, cantidad){
    const carrito = await models.CarritoDeCompra.findOne({
        where: {
            cdc_carrito_de_compra_id: carrito_id
        }
    });
    let jsonCarrito = null;
    if(!!carrito){
        await models.ProductoCarritoDeCompra.destroy({
            where: {
                pcdc_carrito_de_compra_id: carrito_id,
                pcdc_prod_producto_id: producto_id
            }
        });
        const socio_negocio = await models.SociosNegocio.findOne({
            where: {
                sn_socios_negocio_id: carrito.dataValues.cdc_sn_socio_de_negocio_id
            },
            include: [
                {
                    model: models.ListaPrecio
                },
                {
                    model: models.ControlMaestroMultiple,
                    as: 'tipo_impuesto'
                }
            ]
        });
        
        const producto_search = await models.Producto.findOne({
            where: {
                prod_producto_id: producto_id
            },
            include: [
                {
                    model: models.Marca
                }
            ]
        });
        
        const jsonDescuentos = [
            {
                nombre: 'producto', descuento: !!producto_search ? producto_search.dataValues.prod_descuento : 0
            },
            {
                nombre: 'marca', descuento: !!producto_search ? !!producto_search.dataValues.marca ? producto_search.dataValues.marca.dataValues.mar_descuento : 0 : 0
            },
            {
                nombre: 'socio_negocio', descuento: !!socio_negocio ? socio_negocio.dataValues.sn_descuento : 0
            },
            {
                nombre: 'lista_de_precio', descuento: !!socio_negocio  ? !!socio_negocio.dataValues.lista_de_precio ? socio_negocio.dataValues.lista_de_precio.listp_descuento: 0 : 0 
            }
        ];
        let oJSON = JSON.stringify(sortJSON(jsonDescuentos, 'descuento', 'desc'));
        if(!!socio_negocio){
            const precio_lista_de_precio = await models.ProductoListaPrecio.findOne({
                where: {
                    pl_prod_producto_id: producto_id,
                    pl_listp_lista_de_precio_id: !!socio_negocio.dataValues.lista_de_precio ? socio_negocio.dataValues.lista_de_precio.dataValues.listp_lista_de_precio_id : 0
                }
            });
            if(!!precio_lista_de_precio){
                console.log('precio_lista')
                const producto_carrito_add = await models.ProductoCarritoDeCompra.create({
                    pcdc_carrito_de_compra_id: carrito_id,
                    pcdc_prod_producto_id: producto_id,
                    pcdc_producto_cantidad: cantidad,
                    pcdc_mejor_descuento: oJSON,
                    pcdc_lista_precio: true
                });
            }else{
                console.log('precio_lista else')
                const producto_carrito_add = await models.ProductoCarritoDeCompra.create({
                    pcdc_carrito_de_compra_id: carrito_id,
                    pcdc_prod_producto_id: producto_id,
                    pcdc_producto_cantidad: cantidad,
                    pcdc_mejor_descuento: oJSON,
                    pcdc_lista_precio: false
                });
            }
        }else{
            console.log('socio_negocio');
            const producto_carrito_add = await models.ProductoCarritoDeCompra.create({
                pcdc_carrito_de_compra_id: carrito_id,
                pcdc_prod_producto_id: producto_id,
                pcdc_producto_cantidad: cantidad,
                pcdc_mejor_descuento: oJSON,
                pcdc_lista_precio: false
            });
        }

        const productos_carrito_de_compra = await models.ProductoCarritoDeCompra.findAll({
            where:{
                pcdc_carrito_de_compra_id: carrito_id
            }
        });
        let total_sin_impuesto = 0;
        let total_con_impuesto = 0;
        let impuesto = 0;
        productos_carrito_de_compra.forEach(async function(productoActual, index){
            console.log('producto ', (productos_carrito_de_compra.length -1), index)
            const producto = await models.Producto.findOne({
                where:{ 
                    prod_producto_id: productoActual.dataValues.pcdc_prod_producto_id
                }
            });
            if(productoActual.dataValues.pcdc_lista_precio){
                console.log('tiene lista de precio');
                const precio_lista = await models.ProductoListaPrecio.findOne({
                    where: {
                        pl_prod_producto_id: producto.dataValues.prod_producto_id,
                        pl_listp_lista_de_precio_id: carrito.dataValues.cdc_lista_precio
                    }
                });
                if(!!precio_lista){
                    console.log('Tiene precio');
                    if(producto.dataValues.prod_precio < precio_lista.dataValues.pl_precio_producto){
                       if(!!productoActual.dataValues.pcdc_mejor_descuento[0]['descuento']){
                            if(Number(productoActual.dataValues.pcdc_mejor_descuento[0]['descuento']) < 10){
                                let descuento = producto.dataValues.prod_precio *  Number('.0' +productoActual.dataValues.pcdc_mejor_descuento[0]['descuento'])
                                total_sin_impuesto = total_sin_impuesto + ((producto.dataValues.prod_precio - descuento)  * productoActual.dataValues.pcdc_producto_cantidad);
                            }else if(Number(productoActual.dataValues.pcdc_mejor_descuento[0]['descuento']) >= 10){
                                let descuento = producto.dataValues.prod_precio *  Number('.' +productoActual.dataValues.pcdc_mejor_descuento[0]['descuento'])
                                total_sin_impuesto = total_sin_impuesto + ((producto.dataValues.prod_precio - descuento)  * productoActual.dataValues.pcdc_producto_cantidad);  
                            }
                       }else{
                           total_sin_impuesto = total_sin_impuesto +  (producto.dataValues.prod_precio * productoActual.dataValues.pcdc_producto_cantidad);
                       }
                    }if(precio_lista.dataValues.pl_precio_producto < producto.dataValues.prod_precio){
                        if(!!productoActual.dataValues.pcdc_mejor_descuento[0]['descuento']){
                            if(Number(productoActual.dataValues.pcdc_mejor_descuento[0]['descuento']) < 10){
                                let descuento = precio_lista.dataValues.pl_precio_producto *  Number('.0' +productoActual.dataValues.pcdc_mejor_descuento[0]['descuento'])
                                total_sin_impuesto = total_sin_impuesto + ((precio_lista.dataValues.pl_precio_producto - descuento)  * productoActual.dataValues.pcdc_producto_cantidad);
                            }else if(Number(productoActual.dataValues.pcdc_mejor_descuento[0]['descuento']) >= 10){
                                let descuento = precio_lista.dataValues.pl_precio_producto *  Number('.' +productoActual.dataValues.pcdc_mejor_descuento[0]['descuento'])
                                total_sin_impuesto = total_sin_impuesto + ((precio_lista.dataValues.pl_precio_producto - descuento)  * productoActual.dataValues.pcdc_producto_cantidad);  
                            }
                        }else{
                            total_sin_impuesto = total_sin_impuesto +  (precio_lista.dataValues.pl_precio_producto * productoActual.dataValues.pcdc_producto_cantidad);
                        }
                    }
                }else{
                    console.log('No tiene precio');
                    if(!!productoActual.dataValues.pcdc_mejor_descuento[0]['descuento']){
                        if(Number(productoActual.dataValues.pcdc_mejor_descuento[0]['descuento']) < 10){
                            let descuento = producto.dataValues.prod_precio *  Number('.0' +productoActual.dataValues.pcdc_mejor_descuento[0]['descuento'])
                            total_sin_impuesto = total_sin_impuesto + ((producto.dataValues.prod_precio - descuento)  * productoActual.dataValues.pcdc_producto_cantidad);
                        }else if(Number(productoActual.dataValues.pcdc_mejor_descuento[0]['descuento']) >= 10){
                            let descuento = producto.dataValues.prod_precio *  Number('.' +productoActual.dataValues.pcdc_mejor_descuento[0]['descuento'])
                            total_sin_impuesto = total_sin_impuesto + ((producto.dataValues.prod_precio - descuento)  * productoActual.dataValues.pcdc_producto_cantidad);  
                        }
                   }else{
                       total_sin_impuesto = total_sin_impuesto +  (producto.dataValues.prod_precio * productoActual.dataValues.pcdc_producto_cantidad);
                   }
                }
            }else{
                console.log('No tiene lista de precios');
                if(!!productoActual.dataValues.pcdc_mejor_descuento[0]['descuento']){
                    if(Number(producto.dataValues.pcdc_mejor_descuento[0]['descuento']) < 10){
                        let descuento = producto.dataValues.prod_precio *  Number('.0' +productoActual.dataValues.pcdc_mejor_descuento[0]['descuento'])
                        total_sin_impuesto = total_sin_impuesto + ((producto.dataValues.prod_precio - descuento)  * productoActual.dataValues.pcdc_producto_cantidad);
                    }else if(Number(productoActual.dataValues.pcdc_mejor_descuento[0]['descuento']) >= 10){
                        let descuento = producto.dataValues.prod_precio *  Number('.' +productoActual.dataValues.pcdc_mejor_descuento[0]['descuento'])
                        total_sin_impuesto = total_sin_impuesto + ((producto.dataValues.prod_precio - descuento)  * productoActual.dataValues.pcdc_producto_cantidad);  
                    }
               }else{
                   total_sin_impuesto = total_sin_impuesto +  (producto.dataValues.prod_precio * productoActual.dataValues.pcdc_producto_cantidad);
               }
            }
            //Termina el ciclo
            if((productos_carrito_de_compra.length -1) == index){
                await carrito.update({
                    cdc_total_carrito: total_sin_impuesto
                });
                console.log('terminamos', carrito);
                if(!!socio_negocio){
                    impuesto = await total_sin_impuesto * parseFloat('0.'+socio_negocio.dataValues.tipo_impuesto.cmm_valor.replace(/\D/g,'')) < 10 ? parseFloat('0.0'+socio_negocio.dataValues.tipo_impuesto.cmm_valor.replace(/\D/g,'')) : parseFloat('0.'+socio_negocio.dataValues.tipo_impuesto.cmm_valor.replace(/\D/g,'')) ;
                    total_con_impuesto = await total_sin_impuesto + impuesto;
                }else{
                    impuesto = total_sin_impuesto * .16;
                    total_con_impuesto = await total_sin_impuesto + impuesto;
                }
                jsonCarrito = {
                    total_sin_impuesto: total_sin_impuesto, 
                    impuesto: impuesto,
                    total_con_impuesto: total_con_impuesto
                };
                return jsonCarrito;
            }
        });
    }
}