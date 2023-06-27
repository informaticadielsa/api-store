import models from '../models';
const { Op } = require("sequelize");
import statusControlesMaestros from '../mapeos/mapeoControlesMaestrosMultiples';
export default{

    AddProductoToWishList: async(req, res, next) =>{
        try{
            var wl_nombre = req.body.wl_nombre
            var wl_sn_socios_negocio_id = req.body.wl_sn_socios_negocio_id
            //var wlp_cantidad = req.body.wlp_cantidad
            var wlp_prod_producto_id = req.body.wlp_prod_producto_id

            //Buscar el id de la wish list
            const constWishList = await models.WishList.findOne(
            {
                where: {
                    wl_nombre: wl_nombre,
                    wl_sn_socios_negocio_id: wl_sn_socios_negocio_id
                }
            });

            //NO EXISTE Crear el wish list
            if(!constWishList)
            {
                const bodyCreate = {
                    "wl_nombre": wl_nombre,
                    "wl_sn_socios_negocio_id": wl_sn_socios_negocio_id,
                    "wl_cmm_estatus_id": statusControlesMaestros.ESTATUS_WISH_LIST.ACTIVO,
                    "wl_usu_usuario_creador_id": wl_sn_socios_negocio_id
                };
                     
                await models.WishList.create(bodyCreate);
            }
            
            //Buscar el id de la wish list
            const constWishListID = await models.WishList.findOne(
            {
                where: {
                    wl_nombre: wl_nombre,
                    wl_sn_socios_negocio_id: wl_sn_socios_negocio_id
                }
            });
            var wish_list_ID = constWishListID.wl_wish_list_id;


            //SI YA EXISTE SE AGREGARA EL PRODUCTO Y CANTIDAD
            if(constWishListID)
            {
                //Se busca si existe el producto en la wish list para actualizarlo
                const constWishListProductos = await models.WishListProductos.findOne(
                {
                    where: {
                        wlp_wish_list_id: wish_list_ID,
                        wlp_prod_producto_id: wlp_prod_producto_id
                    }
                });

                //Si existe actualizar la cantidad
                if(constWishListProductos)
                {
                    // var newCantidad = constWishListProductos.wlp_cantidad + wlp_cantidad
                    // const bodyUpdate = {
                    //     "wlp_cantidad":  newCantidad,
                    //     "wlp_usu_usuario_modificador_id": wl_sn_socios_negocio_id,
                    //     updatedAt: Date()
                    // }
                    // await constWishListProductos.update(bodyUpdate);
                    res.status(200).send({
                        message: 'Producto ya existe en la wish list'
                    })
                }
                //SI NO EXISTE CREARLO CON UNA CANTIDAD
                else
                {
                    const bodyCreate = {
                        "wlp_wish_list_id": wish_list_ID,
                        "wlp_prod_producto_id": wlp_prod_producto_id,
                        "wlp_usu_usuario_creador_id": wl_sn_socios_negocio_id
                        // "wlp_cantidad": wlp_cantidad
                    };
                         
                    await models.WishListProductos.create(bodyCreate);

                    res.status(200).send({
                        message: 'Producto agregado correctamente a la Wish List'
                    })
                }
            }
            else
            {
                res.status(200).send({
                    message: 'Wish List creada con exito, Producto no fue agregado con exito'
                })
            }


            
        }catch(e){
            res.status(500).send({
                message: 'Error al agregar producto a la wish list',
                e
            });
            next(e);
        }
    },
    deleteProductoFromWish: async(req, res, next) =>{
        try{
            var wl_nombre = req.body.wl_nombre
            var wl_sn_socios_negocio_id = req.body.wl_sn_socios_negocio_id
            var wlp_prod_producto_id = req.body.wlp_prod_producto_id




            //Buscar el id de la wish list
            const constWishList = await models.WishList.findOne(
            {
                where: {
                    wl_nombre: wl_nombre,
                    wl_sn_socios_negocio_id: wl_sn_socios_negocio_id
                }
            });

            //Si existe la lista ya creada se obtendra el id
            if(constWishList)
            {
                var wish_list_ID = constWishList.wl_wish_list_id;

                //Se busca si existe el producto en la wish list para actualizarlo
                const constWishListProductos = await models.WishListProductos.findOne(
                {
                    where: {
                        wlp_wish_list_id: wish_list_ID,
                        wlp_prod_producto_id: wlp_prod_producto_id
                    }
                });

                if(constWishListProductos)
                {
                    models.WishListProductos.destroy(
                    { 
                        where: 
                        { 
                            wlp_wish_list_productos: constWishListProductos.wlp_wish_list_productos
                        }
                    })

                    res.status(200).send({
                        message: 'Producto Eliminado con exito de la wish list'
                    })
                }
                else
                {
                    res.status(500).send({
                        message: 'No se elimino el producto.',
                        razon: 'Producto no encontrado en la wish list'
                    })
                }
            }

            
        }catch(e){
            res.status(500).send({
                message: 'Error al eliminar el producto de la wish list',
                e
            });
            next(e);
        }
    },
    GetWishListFromUser: async(req, res, next) =>{
        try{





            const constWishList = await models.WishList.findOne({
                where: {
                    wl_sn_socios_negocio_id: req.body.wl_sn_socios_negocio_id
                }
            })







            var wl_id = constWishList.wl_wish_list_id








            const constWishListProductos = await models.WishListProductos.findAll({
                where: {
                    wlp_wish_list_id: wl_id
                }
            })


            for (var i = 0; i < constWishListProductos.length; i++) 
            {

            	//Precio base
            	const constProducto = await models.Producto.findOne({
	                where: {
	                    prod_producto_id: constWishListProductos[i].dataValues.wlp_prod_producto_id
	                },
	                attributes: ['prod_producto_id','prod_nombre', 'prod_sku', 'prod_precio']
	            })

            	constWishListProductos[i].dataValues.prod_nombre = constProducto.prod_nombre
                constWishListProductos[i].dataValues.prod_sku = constProducto.prod_sku
            	constWishListProductos[i].dataValues.prod_precio = constProducto.prod_precio




            	// Precio de lista
            	const constProductoListaPrecio = await models.ProductoListaPrecio.findOne({
	                where: {
	                    pl_prod_producto_id: constWishListProductos[i].dataValues.wlp_prod_producto_id,
	                    pl_listp_lista_de_precio_id: req.body.sn_lista_precio
	                },
	                attributes: ['pl_precio_producto']
	            })

            	constWishListProductos[i].dataValues.pl_precio_producto = constProductoListaPrecio.pl_precio_producto




            	//Concatenar imagenes


            	const constImagenProducto = await models.ImagenProducto.findOne({
	                where: {
	                    imgprod_prod_producto_id: constWishListProductos[i].dataValues.wlp_prod_producto_id,
	                },
	            })

            	constWishListProductos[i].dataValues.ImagenProducto = constImagenProducto







            }


            //Se envia la variable directa
            constWishList.dataValues.productos = constWishListProductos



            res.status(200).send({
                message:'Lista de productos de wish list',
                constWishList
            })
        }catch(e){
            res.status(500).send({
                message: 'Error al obtener detalle de wish list',
                e
            });
            next(e);
        }
    },
    
};