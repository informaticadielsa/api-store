import models from '../models';
import statusControles from '../mapeos/mapeoControlesMaestrosMultiples';
const { Op } = require("sequelize");
import {  Sequelize } from 'sequelize';
const sequelize = new Sequelize(process.env.POSTGRESQL);
export default {

    finishQuotesCart: async(req, res, next) =>{
        try
        {
            // Actualizar Estatus de cotizacion 1000198

            const itemCotizacion = await models.Cotizaciones.findOne(
                {
                    where: {
                        cot_cotizacion_id: req.body.idCotizacion,
                        cot_sn_socios_negocio_id: req.body.sn_socios_negocio_id
                    }
                })

            if(itemCotizacion){
          
             await itemCotizacion.update({cot_cmm_estatus_id:1000198})

             let arrayProducts =[]
             if(req.body.productos){
                
                for(var i=0; i< req.body.productos.length; i++ ){
                    const itemsProducts = await models.CotizacionesProductos.findOne({
                        where: {
                            cotp_cotizacion_id:  req.body.idCotizacion,
                            cotp_prod_producto_id: req.body.productos[i].idProducto
                        }
                    })

                    const resultProduc =await itemsProducts.update({cotp_flag_compra:1});
                    arrayProducts.push(resultProduc)
                }
            }
            if(itemCotizacion && arrayProducts.length>0){
            res.status(200).send(
            {
               // arrayProducts,
                message: 'Se actualizó correctamente la cotización.',
                status:'success'
            })}else{
                res.status(500).send({
                    message: 'Hubo un error al actualizar la cotizacion | productos.',
                    status:'fail'
                })
            }

            }else{
                res.status(500).send({
                    message: 'No encontramos la cotización, para actualizar el estatus.',
                    status:'fail'
                })
            }
        }
        catch(e)
        {
            res.status(500).send(
            {
              message: 'Error al actualizar el estatus de la cotización',
              e
            });
            next(e);
        }
    }

}