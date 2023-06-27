import models from '../models';
const { Op } = require("sequelize");
import statusControlesMaestros from '../mapeos/mapeoControlesMaestrosMultiples';
export default{

    createProductosKit: async(req, res, next) =>{
        try{


            //Busca si sku del producto existe para poder actualizarlo y crearlo
            const constProducto = await models.Producto.findOne(
            {
                where: {
                    prod_sku: req.body.prodkit_sku
                },
                attributes: {exclude: ['createdAt', 'updatedAt']}   
            });

            if(constProducto)
            {
                const creadoConExito = await models.ProductosKit.create(req.body);
                if(creadoConExito)
                {
                    const bodyUpdate = {
                        "prod_is_kit": "S",
                    }
                    
                    await constProducto.update(bodyUpdate);
                }
                else
                {
                    console.log("no se creo nada")
                }
            }


            
            res.status(200).send({
                message: 'Kit Productos creado con exito'
            })



        }catch(e){
            res.status(500).send({
                message: 'Error al crear la kit de producto',
                e
            });
            next(e);
        }
    },
    // getMarcaById: async(req, res, next) =>{
    //     try{
    //         const marca = await models.Marca.findOne({
    //             where: {
    //                 mar_marca_id: req.params.id
    //             },
    //             include: [
    //                 {
    //                     model: models.ControlMaestroMultiple,
    //                     attributes: {
    //                         exclude: ['cmm_control_id','cmm_nombre','cmm_sistema','cmm_activo','cmm_usu_usuario_creado_por_id','createdAt','cmm_usu_usuario_modificado_por_id','updatedAt']
    //                     }
    //                 }
    //             ],
    //             attributes: {
    //                 exclude : ['mar_usu_usuario_creado_id','createdAt','mar_usu_usuario_modificado_id','updatedAt']
    //             }
    //         })
    //         res.status(200).send({
    //             message:'Marca obtenida con exito',
    //             marca
    //         })
    //     }catch(e){
    //         res.status(500).send({
    //             message: 'Error al obtener detalle de marca',
    //             e
    //         });
    //         next(e);
    //     }
    // },
    getListadoProductosKit: async(req, res, next) =>{
        try{
            const marcas = await models.ProductosKit.findAll(
            {
                where: {
                    prodkit_cmm_estatus_id: { [Op.ne] : statusControlesMaestros.KIT_STATUS.ELIMINADA }
                },
                attributes: {
                    exclude : ['prodkit_usu_usuario_creado_id','createdAt','prod_usu_usuario_modificado_id','updatedAt']
                }
            })
            res.status(200).send({
                message: 'Listado Productos Kits',
                marcas
            })
        }catch(e){
            res.status(500).send({
                message:  'Error al obtener listado de kits',
                e
            });
            next(e);
        }
    },
    updateProductosKit: async(req, res, next) =>{
        try{
            const ProductosKitUpdate = await models.ProductosKit.findOne({
                where: {
                    prodkit_productos_kits_id : req.body.prodkit_productos_kits_id
                }
            });
            await ProductosKitUpdate.update({
                prodkit_sku: !!req.body.prodkit_sku ? req.body.prodkit_sku : ProductosKitUpdate.dataValues.prodkit_sku,
                prodkit_nombre: !!req.body.prodkit_nombre ? req.body.prodkit_nombre : ProductosKitUpdate.dataValues.prodkit_nombre,
                prodkit_cantidad_componentes: !!req.body.prodkit_cantidad_componentes ? req.body.prodkit_cantidad_componentes : ProductosKitUpdate.dataValues.prodkit_cantidad_componentes,
                prodkit_tipo: !!req.body.prodkit_tipo ? req.body.prodkit_tipo : ProductosKitUpdate.dataValues.prodkit_tipo,
                prodkit_cantidad: !!req.body.prodkit_cantidad ? req.body.prodkit_cantidad : ProductosKitUpdate.dataValues.prodkit_cantidad,
                prodkit_cmm_estatus_id: !!req.body.prodkit_cmm_estatus_id ? req.body.prodkit_cmm_estatus_id : ProductosKitUpdate.dataValues.prodkit_cmm_estatus_id,
                prodkit_usu_usuario_modificado_id: req.body.prodkit_usu_usuario_modificado_id,
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
    deleteProductosKit: async(req, res, next) =>{
        try{
            const ProductosKitUpdate = await models.ProductosKit.findOne({
                where: {
                    prodkit_productos_kits_id : req.body.prodkit_productos_kits_id
                }
            });
            const Eliminada = await ProductosKitUpdate.update({
                prodkit_cmm_estatus_id: statusControlesMaestros.KIT_STATUS.ELIMINADA,
                prodkit_usu_usuario_modificado_id: req.body.prodkit_usu_usuario_modificado_id,
                updatedAt: Date()
            });

            

            if(Eliminada)
            {

                //Busca si sku del producto existe para poder actualizarlo a que no ex kit
                const constProducto = await models.Producto.findOne(
                {
                    where: {
                        prod_sku: ProductosKitUpdate.dataValues.prodkit_sku
                    },
                    attributes: {exclude: ['createdAt', 'updatedAt']}   
                });
                if(constProducto){
                    const bodyUpdate = {
                        "prod_is_kit": "N",
                    }
                    
                    await constProducto.update(bodyUpdate);
                }
            }


            res.status(200).send({
                message: 'Kit eliminado exitosamente'
            })
        }catch(e){
            res.status(500).send({
                message: 'Error al eliminar la marca seleccionada',
                e
            });
            next(e);
        }
    }
};