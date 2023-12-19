import models from '../models';
const { Op } = require("sequelize");
import {  Sequelize } from 'sequelize';
const DIREXCEL = './public/excel/temp';
const sequelize = new Sequelize(process.env.POSTGRESQL);
import fs from 'fs';

import request from 'request-promise';
import XLSX from  'xlsx';
import fileUploadUtil from "../services/fileUploadUtil";
import Coleccion from '../models/ColeccionModel';
const fsPromises = fs.promises;
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
                updatedAt:Date (),
                link: req.body.link
            
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
                    //id: req.params.id
                    orden:req.params.id 

                }
                 })

               const  productosColeccion = await models.ProductosColecciones.findAll({where:{//idColeccion:req.params.id, 
                                                                                        idColeccion: coleccion.id}
            
            })

               if(coleccion && productosColeccion){
                let newDataLineasProyecto = [];
                    for(let i=0; i< productosColeccion.length; i++){
                        const dataLineasProyecto = await sequelize.query(`
                        SELECT distinct on (pro.prod_nombre_extranjero) pro.prod_nombre_extranjero,pro.prod_producto_id,pro.prod_sku,pro.prod_nombre, lpro.*, img.imgprod_nombre_archivo, img.imgprod_ruta_archivo FROM productos_coleccion AS lpro
                        LEFT JOIN productos AS pro ON pro."prod_nombre_extranjero" = lpro."producto_Sku"
                        LEFT JOIN imagenes_producto AS img ON img.imgprod_prod_producto_id = pro.prod_producto_id
                        WHERE lpro."producto_Sku" = '${productosColeccion[i].producto_Sku}'
                        
                        `,
                    {
                        type: sequelize.QueryTypes.SELECT 
                    });
                    if (dataLineasProyecto){
                        newDataLineasProyecto.push(dataLineasProyecto[0])
                    }

                    }

                  

 

                res.status(200).send(
                    {
                       // arrayProducts,
                        coleccion,
                        productosColeccion:newDataLineasProyecto,
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
    ,getCollectionProducts: async(req,res,next)=>{
        try {
               const  coleccion = await models.Colecciones.findOne({ 
                where: { 
                    id:  req.params.id
                    //orden:req.params.id
                }
                 })

               const  productosColeccion = await models.ProductosColecciones.findAll({where:{  
                 idColeccion:req.params.id}
            })

               if(coleccion && productosColeccion){
                let newDataLineasProyecto = [];
                    for(let i=0; i< productosColeccion.length; i++){
                        const dataLineasProyecto = await sequelize.query(`
                        SELECT distinct on (pro.prod_nombre_extranjero) pro.prod_nombre_extranjero,pro.prod_producto_id,pro.prod_sku,pro.prod_nombre, lpro.*, img.imgprod_nombre_archivo, img.imgprod_ruta_archivo FROM productos_coleccion AS lpro
                        LEFT JOIN productos AS pro ON pro."prod_nombre_extranjero" = lpro."producto_Sku"
                        LEFT JOIN imagenes_producto AS img ON img.imgprod_prod_producto_id = pro.prod_producto_id
                        WHERE lpro."producto_Sku" = '${productosColeccion[i].producto_Sku}'
                        
                        `,
                    {
                        type: sequelize.QueryTypes.SELECT 
                    });
                    if (dataLineasProyecto){
                        newDataLineasProyecto.push(dataLineasProyecto[0])
                    }

                    }

                  

 

                res.status(200).send(
                    {
                       // arrayProducts,
                        //coleccion,
                        productosColeccion:newDataLineasProyecto,
                        message: 'Se obtuvo correctamente la lista de productos de la coleccion.',
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
              message: 'Tuvimos un error al obtener la coleccion.',
              status:'fail',
              e
            });
            next(e);
        }
        },
    uploadExcelProductsCollection: async (req, res, next)=>{
            try{
                const productos =[]
                await fs.readdir(DIREXCEL, async function(err, archivos){
                    if(err){
                        onerror(err);
                        return;
                    }
                    archivos.forEach(async function(archivo, indexArchivo){
                        req.files.forEach(async function(archivoUpload, indexUpload){
                            if(archivo == archivoUpload.filename){
                                console.log('archivo', archivo, archivoUpload.filename);
    
                                //Cargar Atributos de producto
                                    var workbook = XLSX.readFile(DIREXCEL+"/"+archivo);
                                    var sheet_name_list = workbook.SheetNames;
                                    var numPlantillaViñetas = 0;
    
                                    for (var i = 0; i < sheet_name_list.length; i++) 
                                    {
                                        if(sheet_name_list[i] == "Plantilla Productos Colecciones")
                                        {
                                            numPlantillaViñetas = i
                                            break
                                        }
                                    }
    
                                    var xlData = XLSX.utils.sheet_to_json(workbook.Sheets[sheet_name_list[numPlantillaViñetas]]);
    
   
                                    //AGREGAR JSONS POR SKU
                                    for (var i = 0; i < xlData.length; i++) 
                                    {   
                                        //Ver si existe el producto hijo, luego obtiene el padre
                                        
                                        //console.log(xlData[i].SKU)
                                       
                                        /* const productoUpdate = await models.Producto.findOne({
                                            where: {
                                                prod_sku: xlData[i].SKU
                                            }
                                        });*/

                                       // productos.push(xlData[i].Id_coleccion)
                                        const  coleccion = await models.Colecciones.findOne({ 
                                            where: { 
                                                id: parseInt(xlData[i].Id_coleccion)                        
                                            }
                                             })

                                         if(coleccion){
                                           const  productosColeccion = await models.ProductosColecciones.findOne({where:{idColeccion:parseInt(xlData[i].Id_coleccion), producto_Sku:xlData[i].Sku_Producto}
                                            })
                                        if(!productosColeccion){
                                            const  productosColeccion = await models.ProductosColecciones.create({
                                                producto_Sku: xlData[i].Sku_Producto,
                                                idColeccion: xlData[i].Id_coleccion,
                                                estatus:1
                                            })

                                            productos.push(productosColeccion)}

                                         }   

                                        //productos.push(xlData[i].Sku_Producto)
                                    }
                                //Fin cargar atributos d producto
    
    
    
    
    
                            }
    
    
    
                            if(((archivos.length - 1) == indexArchivo) && ((req.files.length -1) == indexUpload)){
                                res.status(200).send({
                                    productos,
                                    message: 'Documento cargado correctamente'
                                });
    
                                await fsPromises.unlink(DIREXCEL + "/" + archivo, err =>
                                {
                                    if(err)
                                    {
                                        return "error";
                                    }
                                });
    
                            }
                        });
                    });
                });
            }catch(e){
                res.status(500).send({
                    message: 'Error al cargar el archivo, no se a podeido procesar de manera adecuada',
                    e
                });
                next(e);
            }
        },
    updateCollection: async(req,res,next)=>{
            try {
                   if(req.body.idColeccion){
                   const  coleccion = await models.Colecciones.findOne({ 
                    where: { 
                        id: req.body.idColeccion
    
                    }
                     })
                   if(coleccion){
                    if(req.body.estatus==3){
                        await models.ProductosColecciones.destroy({where:{idColeccion: req.body.idColeccion}}) 
                        await models.Colecciones.destroy({where:{ id: req.body.idColeccion}})
                    }else{
                    const updCole =await coleccion.update({nombre: req.body.nombre, descripcion: req.body.descripcion, orden: req.body.orden, estatus: req.body.estatus})
                    }
                  
                    res.status(200).send(
                        {
                            message: 'Se actualizo correctamente la coleccion.',
                            status:'success'
                        })
                   }else{
                    res.status(500).send(
                        {
                          message: 'No existe la coleccion.',
                          status:'fail'
                        });
                   }
                }else{
                    res.status(500).send(
                        {
                          message: 'No existe la coleccion, no se puede actualizar',
                          status:'fail'
                        });
                }
        
        
            }catch(e)
            {
                res.status(500).send(
                {
                  message: 'Tuvimos un error al actualizar la coleccion y sus productos',
                  status:'fail',
                  e
                });
                next(e);
            }
            },
    updateCollectionProducts: async(req,res,next)=>{
            try {
                   if(req.body.idColeccion){
                   const  coleccion = await models.Colecciones.findOne({ 
                    where: { 
                        id: req.body.idColeccion
    
                    }
                     })

                   

                   if(coleccion){
                    const updCole =await coleccion.update({nombre: req.body.nombre, descripcion: req.body.descripcion, orden: req.body.orden, link: req.body.link})
                   
                    for(let i=0; i<req.body.productos.length; i++){
                        const  productoColeccion = await models.ProductosColecciones.findOne({where:{idColeccion:req.body.idColeccion, 
                            producto_Sku: req.body.productos[i].productoSku
                        }})
                        if(productoColeccion){
                           await  productoColeccion.update({estatus:req.body.productos[i].estatus})
                        }
                    }
                    
                       

                    res.status(200).send(
                        {
                           // arrayProducts,
                            //coleccion,
                            //productosColeccion:newDataLineasProyecto,
                            message: 'Se actualizo correctamente la coleccion y el detalle de sus productos.',
                            status:'success'
                        })
                   }else{
                    res.status(500).send(
                        {
                          message: 'No existe la coleccion.',
                          status:'fail'
                        });
                   }
                }else{
                    res.status(500).send(
                        {
                          message: 'No existe la coleccion, no se puede actualizar',
                          status:'fail'
                        });
                }
        
        
            }catch(e)
            {
                res.status(500).send(
                {
                  message: 'Tuvimos un error al actualizar la coleccion y sus productos',
                  status:'fail',
                  e
                });
                next(e);
            }
            },
    updateProductCollection: async(req,res,next)=>{
                try {
                       if(req.body.idColeccion){
                       const  coleccion = await models.Colecciones.findOne({ 
                        where: { 
                            id: req.body.idColeccion
        
                        }
                         })
    
                       
    
                       if(coleccion){
                          const  productoColeccion = await models.ProductosColecciones.findOne({where:{idColeccion:req.body.idColeccion, 
                                producto_Sku: req.body.productoSku
                            }})
                        
                        
                           
                            if(productoColeccion){
                                if (req.body.estatus ===3){
                                await models.ProductosColecciones.destroy({where:{idColeccion: req.body.idColeccion, producto_Sku: req.body.productoSku}})
                                }else{
                                await  productoColeccion.update({estatus:req.body.estatus})}
                            
                        res.status(200).send(
                            {
                               // arrayProducts,
                                //coleccion,
                                //productosColeccion:newDataLineasProyecto,
                                message: 'Se actualizo correctamente el producto.',
                                status:'success'
                            })}else{
                                res.status(500).send(
                                    {
                                      message: 'No existe el producto en la colección.',
                                      status:'fail'
                                    });
                               }
                            

                       }else{
                        res.status(500).send(
                            {
                              message: 'No existe la coleccion.',
                              status:'fail'
                            });
                       }
                    }else{
                        res.status(500).send(
                            {
                              message: 'No existe la coleccion, no se puede actualizar',
                              status:'fail'
                            });
                    }
            
            
                }catch(e)
                {
                    res.status(500).send(
                    {
                      message: 'Tuvimos un error al actualizar la coleccion y sus productos',
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