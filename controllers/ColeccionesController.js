import models from '../models';
const { Op } = require("sequelize");
import {  Sequelize } from 'sequelize';
const sequelize = new Sequelize(process.env.POSTGRESQL);
export default {

    createCollection: async(req, res, next) =>{
        try
        {

            //req.body.huls
            if(!req.body.nombre)  {res.status(500).send({
                message: 'La colección debe llevar un nombre.',
                status:'fail'
            })}else{

            const coleccionId= await models.Colecciones.create({
                nombre: req.body.nombre,
                descripcion: req.body.descripcion,
                estatus: req.body.estatus,
                createdAt: Date(),
                updatedAt:Date ()
            
            })
            if(coleccionId.dataValues.id){
            res.status(200).send(
            {
               // arrayProducts,
                message: 'Se creo correctamente la colección.',
                status:'success'
            })}else{
           
                res.status(500).send({
                    message: 'Hubo un detalle al crear la colección.',
                    status:'fail'
                })
            }}
        }
        catch(e)
        {
            res.status(500).send(
            {
              message: 'Tuvimos un error al crear la colección',
              status:'fail',
              e
            });
            next(e);
        }
    },
    getCollections: async(req,res,next)=>{
    try {
           const  colecciones = await models.Colecciones.findAll({
            attributes: {exclude: ['createdAt', 'updatedAt']}});
           if(colecciones){
            res.status(200).send(
                {
                   // arrayProducts,
                    colecciones,
                    message: 'Se obtuvo correctamente la lista de colecciones.',
                    status:'success'
                })
           }


    }catch(e)
    {
        res.status(500).send(
        {
          message: 'Tuvimos un error al obtener las colecciones',
          status:'fail',
          e
        });
        next(e);
    }
    },
    getCollectionIdFind: async(req,res,next)=>{
        try {
               const  coleccion = await models.Colecciones.findOne({ 
                where: { 
                    id: req.params.id 

                }
                 })

               const  productosColeccion = await models.ProductosColecciones.findAll({where:{idColeccion:req.params.id}
            
            })

               if(coleccion){

 

                res.status(200).send(
                    {
                       // arrayProducts,
                        coleccion,
                        productosColeccion,
                        message: 'Se obtuvo correctamente la coleccion y el detalle.',
                        status:'success'
                    })
               }else{
                res.status(500).send(
                    {
                      message: 'No existe la coleccion.',
                      status:'fail'
                    });
               }
    
    
        }catch(e)
        {
            res.status(500).send(
            {
              message: 'Tuvimos un error al obtener las colecciones',
              status:'fail',
              e
            });
            next(e);
        }
        }
    ,
    addProductosCollection: async(req,res,next)=>{
        try {
               const  coleccion = await models.Colecciones.findOne({ 
                where: { 
                    id: req.params.id 

                }
                 })

               const  productosColeccion = await models.ProductosColecciones.findAll({where:{idColeccion:req.params.id}
            
            })

               if(coleccion){

 

                res.status(200).send(
                    {
                       // arrayProducts,
                        coleccion,
                        productosColeccion,
                        message: 'Se obtuvo correctamente la coleccion y el detalle.',
                        status:'success'
                    })
               }else{
                res.status(500).send(
                    {
                      message: 'No existe la coleccion.',
                      status:'fail'
                    });
               }
    
    
        }catch(e)
        {
            res.status(500).send(
            {
              message: 'Tuvimos un error al obtener las colecciones',
              status:'fail',
              e
            });
            next(e);
        }
        },





    getCollectionId: async(req, res, next)=>{
        await models.Colecciones.create()

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

        const proyectos = await models.Proyectos.findOne({
            where: {
                idProyecto: element.id,
            },
        });

    }

}