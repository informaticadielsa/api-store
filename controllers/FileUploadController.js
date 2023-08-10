import AdmZip from 'adm-zip';
import fs from 'fs';
import statusControllers from '../mapeos/mapeoControlesMaestrosMultiples';
import path from 'path';
import statusControles from '../mapeos/mapeoControlesMaestrosMultiples';
const { Op } = require("sequelize");
import {  Sequelize } from 'sequelize';
const sequelize = new Sequelize(process.env.POSTGRESQL);
import models from '../models';
const DIR = './public/img/';
const DIRAR = './public/compressed/';
const DIRPDF = './public/pdf/';
const DIRFILECHECKOUT = './public/purchase_order/';
const PRIVATE_SOLICITUD = './private/compressed';
const DIREXCEL = './public/excel/temp';
import request from 'request-promise';
import XLSX from  'xlsx';
import fileUploadUtil from "../services/fileUploadUtil";
const fsPromises = fs.promises;








export default{
    uploadZipFile: async(req, res, next) =>{
        try{

            //Leemos el directorio compres y extraemos las imagenes en la carpeta temporal
            await fs.readdir(DIRAR, async function(err, archivos){
                if(err){
                    onerror (err);
                    return;
                }
                //Sino existe la carpeta temp, la cramos
                if(!fs.existsSync(DIRAR + 'temp')){
                    await fs.promises.mkdir(DIRAR + 'temp', { 
                        recursive: true 
                    });
                }
                //Recorremos todos los archivos que esten  en compressed (No debe de exisit más de uno)
                if(fs.existsSync(DIRAR + 'temp')){
                    archivos.forEach(async (archivo) =>{
                        if(archivo != 'temp'){
                            const zip = new AdmZip(DIRAR + archivo);
                            zip.extractAllTo(DIRAR + 'temp');
                            const zipEntries = zip.getEntries(); // an array of ZipEntry records
                            zipEntries.forEach(async function(zipEntry) {
                                const nombreCarpeta = zipEntry.entryName.split('_')[0];
                                if(fs.existsSync(DIR + nombreCarpeta)){
                                    await fs.readdir(DIR + nombreCarpeta, async function(err, archivosDelete) {
                                        if(err){
                                            onerror(err);
                                            return;
                                        }
                                        console.log('ESTAMOS EN EL READ DIR', archivosDelete);
                                        if(archivosDelete.length > 0){
                                            archivosDelete.forEach(async function(archivoDelete){
                                                console.log('entra ha eliminar archivos', archivoDelete);
                                                await fs.unlink(DIR + nombreCarpeta + '/' + archivoDelete, async function(err){
                                                    if(err){
                                                        console.log('ERROR AL ELIMINAR', err);
                                                        onerror(err);
                                                        return;
                                                    }
                                                        const producto = await models.Producto.findOne({
                                                            where: {
                                                                prod_sku: nombreCarpeta
                                                            }
                                                        });
                                                        console.log(producto.dataValues.prod_producto_id, '<---- este es el id de producto');
                                                        await models.ImagenProducto.destroy({
                                                            where: {
                                                                imgprod_prod_producto_id: producto.dataValues.prod_producto_id
                                                            }
                                                        });
                                                    console.log('File delete');
                                                })
                                            });
                                        }
                                    });
                                }
                            });
                            //Extraemos el archivo y lo eliminamos despues de extraerlo
                            await fs.unlink(DIRAR + archivo, err =>{
                                if(err){
                                    onerror(err);
                                    return;
                                }
                            });
                        }
                    });


                    //Una vez extraidos barremos la carpeta temp
                    await fs.readdir(DIRAR + 'temp', function(err, archivos){
                        if(err){
                            onerror (err);
                            return;
                        }
                        //Barremos todos los archivos que exiten en la carpeta temporal
                        archivos.forEach(async (archivo)  =>{
                            //Nombre de carpeta que se va ha crear para el producto
                            const tempName = archivo.split('_')[0];
                            console.log('TEMPNAME', tempName);
                            //Sino existe la carpeta con ese SKU, la creamos....
                            if(!fs.existsSync(DIR + tempName)){
                                await fs.promises.mkdir(DIR + tempName, { 
                                    recursive: true 
                                });
                            }
                            //Movemos los archivos de la carpeta temporal a su respectiva carpeta
                            await fs.rename(DIRAR + 'temp/' + archivo, DIR + tempName + '/' + archivo, async function(err){
                                if(err){
                                    console.log(err);
                                    onerror(err);
                                    return;
                                }
                                const producto = await models.Producto.findOne({
                                    where: {
                                        prod_sku: tempName
                                    }
                                });
                                await models.ImagenProducto.create({
                                    imgprod_prod_producto_id: producto.dataValues.prod_producto_id,
                                    imgprod_nombre_archivo: archivo,
                                    imgprod_ruta_archivo: DIR + tempName + '/' + archivo,
                                    imgprod_usu_usuario_creador_id: req.body.imgprod_usu_usuario_creador_id
                                });
                                console.log('File move success!');
                            });
                        });
                    });
                }
            });
                
               
            res.status(200).send({
                message: 'Carga exitosa'
            })
        }catch(e){
            res.status(500).send({
                message: 'Error al cargar archivos',
                e
            });
            next(e);
        }
    },
    deleteFileOfProduct: async(req, res, next) =>{
        try{
            const getProducto = await models.ImagenProducto.findOne({
                where: {
                    imgprod_imagen_producto_id: req.body.imgprod_imagen_producto_id
                }
            });
            const nombreCarpeta = getProducto.dataValues.imgprod_nombre_archivo.split('_')[0];

            console.log('ELIMINACION\n', DIR + nombreCarpeta + '/' + getProducto.dataValues.imgprod_nombre_archivo);
            await fs.unlink(DIR + nombreCarpeta + '/' + getProducto.dataValues.imgprod_nombre_archivo, async function(err){
                if(err){
                    onerror(err);
                    return;
                }
                console.log('File delte success!');
                await models.ImagenProducto.destroy({
                    where: {
                        imgprod_imagen_producto_id: getProducto.dataValues.imgprod_imagen_producto_id
                    }
                });
            })
            res.status(200).send({
                message: 'Eliminación correcta',
                getProducto
            });
        }catch(e){
            res.status(500).send({
                message: 'Error al eliminar el archivo',
                e
            });
            next(e);
        }
    },
    uploadFileToProduct: async(req, res, next) =>{
        try{
            const producto = await models.Producto.findOne({
                where: {
                    prod_producto_id: req.body.prod_producto_id
                }
            });
            if(!!producto){
                await fs.readdir(DIR + 'temp', async function(err, archivos){
                    if(err){
                        onerror(err);
                        return;
                    }
                    archivos.forEach(async function(archivo, indexArchivo){
                        req.files.forEach(async function(archivoUpload, indexUpload){
                            if(archivo == archivoUpload.filename){
                                console.log('Concuerda', archivo, archivoUpload.filename);
                                if(!!producto.dataValues.prod_sku){
                                    if(!fs.existsSync(DIR + producto.dataValues.prod_sku)){
                                        await fs.promises.mkdir(DIR + producto.dataValues.prod_sku, { 
                                            recursive: true 
                                        });
                                    }
                                    if(fs.existsSync(DIR + producto.dataValues.prod_sku)){
                                        await fs.rename(DIR + 'temp' +  '/' + archivo, DIR + producto.dataValues.prod_sku + '/' + producto.dataValues.prod_sku + '_' + archivo, async function(err){
                                            await models.ImagenProducto.create({
                                                imgprod_prod_producto_id: producto.dataValues.prod_producto_id,
                                                imgprod_nombre_archivo: producto.dataValues.prod_sku + '_' + archivo,
                                                imgprod_ruta_archivo: DIR + producto.dataValues.prod_sku + '/' + producto.dataValues.prod_sku + '_' + archivo,
                                                imgprod_usu_usuario_creador_id: req.body.imgprod_usu_usuario_creador_id
                                            });
                                            console.log('File move success!');
                                        });
                                    }
                                }
                            }
                            if(((archivos.length - 1) == indexArchivo) && ((req.files.length -1) == indexUpload)){
                                const imagenes = await models.ImagenProducto.findAll({
                                    where: { imgprod_prod_producto_id: req.body.prod_producto_id }
                                })
                                res.status(200).send({
                                    message: 'Archivos cargados correctamente',
                                    imagenes
                                });

                            }
                        });
                    });
                });
            }else{
                res.status(300).send({
                    message: 'Producto no existe y/o no esta disponible.'
                })
            }
        }catch(e){
            res.status(500).send({
                message: 'No fue posible cargar el/los archivos',
                e
            });
            next(e);
        }
    },
    uploadDataSheetProduct: async(req, res, next) =>{
        try{
            const producto = await models.Producto.findOne({
                where: {
                    prod_producto_id: req.body.prod_producto_id
                }
            });
            
            if(!!producto){
                // Se crea la carpeta
                if(!fs.existsSync(DIRPDF + req.files[0].originalname.split('_')[0] )){
                    await fs.promises.mkdir(DIRPDF + req.files[0].originalname.split('_')[0], { 
                        recursive: true 
                    });
                }
                // Se leen los archivos de la carpeta temporal
                await fs.readdir(DIRPDF + 'temp', async function(err, archivos){
                    console.log('QUE TIENES?',err, archivos);
                    if(err){
                        onerror(err);
                        return;
                    }

                    archivos.forEach(async function(archivo, indexArchivo){
                        const dirDest = req.files[0].originalname.split('_')[0] + '/';
                        const nombreDest = req.files[0].originalname;                        
                        
                        if ( archivo === req.files[0].filename ) { 
                            // Antes de crear el archivo verificamos que no exista otro archivo...
                            const producto_data_sheet = await models.ProductoDataSheet.findOne({
                                where:{
                                    pds_prod_producto_id: req.body.prod_producto_id,
                                    pds_nombre_data_sheet: nombreDest
                                }
                            });
                            console.log(req.body.prod_producto_id);
                            console.log(nombreDest);
                            console.log(producto_data_sheet);
                            if(!!producto_data_sheet){
                                //Modificamos la relación en la base de datos 
                                await producto_data_sheet.update({ 
                                    pds_nombre_data_sheet: nombreDest,
                                    pds_usu_usuario_creador_id: req.body.pds_usu_usuario_creador_id
                                });
                                // console.log('File update!');
                                console.log('File update!', data_sheet);
                            }else{
                                // Creamos la relación en la base de datos 
                                const data_sheet = await models.ProductoDataSheet.create({
                                    pds_prod_producto_id: producto.dataValues.prod_producto_id,
                                    pds_nombre_data_sheet: nombreDest,
                                    pds_ruta_archivo: DIRPDF + dirDest + nombreDest,
                                    pds_usu_usuario_creador_id: req.body.pds_usu_usuario_creador_id
                                });
                                // console.log('File create!');
                                console.log('File create!', data_sheet);
                            }
                        }
                        
                        var resultkk = await fsPromises.rename(DIRPDF + 'temp/' + archivo, DIRPDF + dirDest + nombreDest)
                        {
                        };
                    });
                });   
                
                res.status(200).send({
                    message: 'Ficha técnica cargada correctamente'
                });
            }else{
                res.status(500).send({
                    message: 'Error al cargar ficha, producto eliminado y/o inexistente'
                })
            }
        }catch(e){
            console.log(e);
            await fs.readdir(DIRPDF + 'temp', async function(err, archivos){
                if(err){
                    onerror(err);
                    return;
                }

                archivos.forEach(async function(archivo, indexArchivo){
                    
                    var resultadoEliminacion = await fsPromises.unlink(DIRPDF + 'temp/' + archivo)
                    {

                    }
                    console.log("borrado: "+DIRPDF + 'temp/' + archivo)
                });
            });   
            res.status(500).send({
                message: 'No fue posible cargar el/los archivos',
                e
            });
            next(e);
        }
    },
    getDataSheetProductLength: async(req, res, next) =>{ // Traer de momento el más reciente o aplicar 
        try{
            const listProductDataSheet = await models.ProductoDataSheet.findAll({
                where:{
                    pds_prod_producto_id: req.params.productId
                },
                attributes: {
                    exclude: [
                        "pds_nombre_data_sheet",
                        "pds_producto_data_sheet_id",
                        "pds_prod_producto_id",
                        'pds_usu_usuario_creador_id',
                        'createdAt',
                        'updatedAt'
                    ]
                },
            });

            res.status(200).send({
                message: 'Archivos cargados correctamente',
                countListProductDataSheet: listProductDataSheet.length
            });

        }catch(e){
            res.status(500).send({
                message: 'No fue posible cargar el archivos',
                e
            });
            next(e);
        }
    },
    getDataSheetProduct: async(req, res, next) =>{ // Traer de momento el más reciente o aplicar 
        try{
            const producto = await models.Producto.findOne({
                where: {
                    prod_sku: req.params.prod_sku
                }
            });
            const listProductDataSheet = await models.ProductoDataSheet.findAll({
                where:{
                    pds_prod_producto_id: producto.prod_producto_id
                },
                attributes: {
                    exclude: [
                        "pds_nombre_data_sheet",
                        "pds_producto_data_sheet_id",
                        "pds_prod_producto_id",
                        'pds_usu_usuario_creador_id',
                        'createdAt',
                        'updatedAt'
                    ]
                },
            });
            const ruta = listProductDataSheet[req.params.position-1]
            res.status(200).send({
                message: 'Archivos cargados correctamente',
                pds_ruta_archivo: ruta.pds_ruta_archivo
                
            });

        }catch(e){
            res.status(500).send({
                message: 'No fue posible cargar el archivos',
                e
            });
            next(e);
        }
    },
    deleteFileDataSheet: async(req, res, next) =>{
        try{
            console.log(req.body)
            const getProducto = await models.ProductoDataSheet.findOne({
                where: {
                    pds_prod_producto_id: req.body.pds_prod_producto_id,
                    pds_nombre_data_sheet: req.body.pds_nombre_data_sheet
                }
            });
            if(!!getProducto){
                await fs.unlink(getProducto.dataValues.pds_ruta_archivo, async function(err){
                    if(err){
                        console.log(err);
                        return;
                    }
                    console.log('File delte success!');
                    await models.ProductoDataSheet.destroy({
                        where: {
                            pds_prod_producto_id: getProducto.dataValues.pds_prod_producto_id,
                            pds_nombre_data_sheet: getProducto.dataValues.pds_nombre_data_sheet
                        }
                    });
                })
                res.status(200).send({
                    message: 'Eliminación correcta',
                    getProducto
                });
            }else{
                res.status(300).send({
                    message: 'Error al eliminar el archivo, no existe ningún archivo.'
                })
            }
        }catch(e){
            res.status(500).send({
                message: 'Error al eliminar el archivo',
                e
            });
            next(e);
        }
    },
    uploadPurchaseOrder: async(req, res, next) =>{
        try{
            const carrito = await models.CarritoDeCompra.findOne({
                where: {
                    cdc_numero_orden: req.body.odc_numero_orden
                }
            });
            
            if(!!carrito){
                // Se crea la carpeta
                if(!fs.existsSync(DIRFILECHECKOUT + req.body.odc_numero_orden)){
                    await fs.promises.mkdir(DIRFILECHECKOUT + req.body.odc_numero_orden, { 
                        recursive: true 
                    });
                }
                // Se leen los archivos de la carpeta temporal
                await fs.readdir(DIRPDF + 'temp', async function(err, archivos){
                    console.log('QUE TIENES?',err, archivos);
                    if(err){
                        onerror(err);
                        return;
                    }

                    archivos.forEach(async function(archivo, indexArchivo){
                        const dirDest = req.body.odc_numero_orden + '/';
                        const nombreDest = req.files[0].originalname;    
                        
                        if ( archivo === req.files[0].filename ) { 
                            // Antes de crear el archivo verificamos que no exista otro archivo...
                            const orden_de_compra = await models.OrdenDeCompra.findOne({
                                where:{
                                    odc_numero_orden: req.body.odc_numero_orden
                                }
                            });
                            
                            if(orden_de_compra){
                                //Eliminamos los archivos que hay en la carpeta para que solo haya 1 por carrito y no queden residuos
                                await fs.readdir(DIRFILECHECKOUT + dirDest, async function(err, files){
                                    if(err){
                                        onerror(err);
                                        return;
                                    }
                    
                                    files.forEach(async function(file, indexArchivo){
                                        
                                        var resultadoEliminacion = await fsPromises.unlink(DIRFILECHECKOUT + dirDest + file)
                                        {
                    
                                        }
                                        console.log("borrado: "+DIRPDF + 'temp/' + archivo)
                                    });
                                });  
                                //Modificamos la relación en la base de datos 
                                await orden_de_compra.update({ 
                                    odc_nombre_archivo: nombreDest,
                                    odc_ruta_archivo: DIRFILECHECKOUT + dirDest + nombreDest,
                                    odc_usu_usuario_creador_id: req.body.odc_usu_usuario_creador_id
                                });
                                console.log('File update!', orden_de_compra);
                            }else{
                                console.log("Entrar al creat");
                                // Creamos la relación en la base de datos 

                                console.log(DIRFILECHECKOUT + dirDest + nombreDest)
                                console.log(req.body.odc_usu_usuario_creador_id)
                                console.log(nombreDest)
                                console.log(req.body.odc_numero_orden)
                                const orden_de_compra_new = await models.OrdenDeCompra.create({
                                    odc_numero_orden: req.body.odc_numero_orden,
                                    odc_nombre_archivo: nombreDest,
                                   odc_ruta_archivo: DIRFILECHECKOUT + dirDest + nombreDest,
                                 // odc_usu_usuario_creador_id: req.body.odc_usu_usuario_creador_id
                                });
                                console.log('File create!', orden_de_compra_new);
                            }
                        }
                        
                        var resultkk = await fsPromises.rename(DIRPDF + 'temp/' + archivo, DIRFILECHECKOUT + dirDest + nombreDest)
                        {
                        };
                    });
                });   
                
                res.status(200).send({
                    message: 'La orden de compra ha sido cargada con éxito',
                    filename: req.files[0].originalname
                });
            }else{
                res.status(500).send({
                    message: 'Error al cargar la orden de compra'
                })
            }
        }catch(e){
            console.log(e);
            await fs.readdir(DIRPDF + 'temp', async function(err, archivos){
                if(err){
                    onerror(err);
                    return;
                }

                archivos.forEach(async function(archivo, indexArchivo){
                    
                    var resultadoEliminacion = await fsPromises.unlink(DIRPDF + 'temp/' + archivo)
                    {

                    }
                    console.log("borrado: "+DIRPDF + 'temp/' + archivo)
                });
            });   
            res.status(500).send({
                message: 'No fue posible cargar el archivo',
                e
            });
            next(e);
        }
    },
    getPurchaseOrder: async(req, res, next) =>{ // Traer de momento el más reciente o aplicar
        try{
            const orden_de_compra = await models.OrdenDeCompra.findOne({
                where:{
                    odc_numero_orden: req.params.numOrder,
                },
                attributes: {
                    exclude: [
                        "odc_orden_de_compra_id",
                        "odc_numero_orden",
                        "odc_usu_usuario_creador_id",
                        'createdAt',
                        'updatedAt'
                    ]
                },
            });
            res.status(200).send({
                message: 'Archivos obtenidos con éxito',
                pds_ruta_archivo: orden_de_compra
                
            });

        }catch(e){
            res.status(500).send({
                message: 'No fue posible obtener los archivos',
                e
            });
            next(e);
        }
    },
    cargaFileToMain: async(req, res, next) =>{
        try
        {
            console.log('\n ************************************************************************* REQBODY \n', req.body, req.files, '\n**************************************************************************************');
            const tipo_imagen = await models.ControlMaestroMultiple.findOne({
                where:{ 
                    cmm_control_id: req.body.adi_cmm_tipo_id,
                    cmm_nombre: 'TIPO_ARCHIVO_MAIN'
                }
            });

            if(!!tipo_imagen)
            {

                console.log(req.files.length)

                if(req.files.length == 1)
                {
                    await fs.readdir(DIR + 'temp', async function(err, archivos){
                        if(err){
                            onerror(err);
                            return;
                        }
                        archivos.forEach(async function(archivo, indexArchivo){
                            req.files.forEach(async function(archivoUpload, indexUpload){
                                if(archivo == archivoUpload.filename){
                                    if(!fs.existsSync(DIR + tipo_imagen.dataValues.cmm_valor)){
                                        await fs.promises.mkdir(DIR + tipo_imagen.dataValues.cmm_valor, { 
                                            recursive: true 
                                        });
                                    }
                                    if(fs.existsSync(DIR + tipo_imagen.dataValues.cmm_valor)){
                                        await fs.rename(DIR + 'temp' +  '/' + archivo, DIR + tipo_imagen.dataValues.cmm_valor + '/' + tipo_imagen.dataValues.cmm_valor + '_' + archivo, async function(err){
                                            const nuevoFile = await models.ArchivosDeInicio.create({
                                                adi_nombre_archivo: String(archivo),
                                                adi_ruta_archivo: String( DIR + tipo_imagen.dataValues.cmm_valor + '/' + tipo_imagen.dataValues.cmm_valor + '_'+ archivo),
                                                adi_titulo: !!req.body.adi_titulo ? String(req.body.adi_titulo) : null,
                                                adi_titulo_2: !!req.body.adi_titulo_2 ? String(req.body.adi_titulo_2) : null,
                                                adi_descripcion: !!req.body.adi_descripcion ? String(req.body.adi_descripcion) : null,
                                                adi_url:  !!req.body.adi_url ? String(req.body.adi_url) : null,
                                                adi_cmm_tipo_id: Number(tipo_imagen.dataValues.cmm_control_id),
                                                adi_cmm_estatus_id: Number(statusControllers.ESTATUS_ARCHIVO_MAIN.ACTIVO),
                                                adi_usu_usuario_creador_id: Number(req.body.adi_usu_usuario_creador_id),
                                                adi_order: !!req.body.adi_order ? req.body.adi_order : 0
                                            });
                                            return console.log('File move success!');
                                        });
                                    }
                                }
                                if(((archivos.length - 1) == indexArchivo) && ((req.files.length -1) == indexUpload)){
                                    const archivos_main = await models.ArchivosDeInicio.findAll({
                                        where: { 
                                            adi_cmm_tipo_id: tipo_imagen.dataValues.cmm_control_id 
                                        },
                                        attributes: {
                                            exclude: [
                                                'adi_usu_usuario_creador_id',
                                                'adi_usu_usuario_modificador_id',
                                                'createdAt',
                                                'updatedAt'
                                            ]
                                        },
                                        include: [
                                            {
                                                model: models.ControlMaestroMultiple,
                                                as: 'tipo_archivo_id',
                                                attributes: {
                                                    exclude: [
                                                        'cmm_sistema',
                                                        'cmm_activo',
                                                        'cmm_usu_usuario_creado_por_id',
                                                        'createdAt',
                                                        'cmm_usu_usuario_modificado_por_id',
                                                        'updatedAt'
                                                    ]
                                                }
                                            },
                                            {
                                                model: models.ControlMaestroMultiple,
                                                as: 'estatus_id',
                                                attributes: {
                                                    exclude: [
                                                        'cmm_sistema',
                                                        'cmm_activo',
                                                        'cmm_usu_usuario_creado_por_id',
                                                        'createdAt',
                                                        'cmm_usu_usuario_modificado_por_id',
                                                        'updatedAt'
                                                    ]
                                                }
                                            }
                                        ],
                                        order: [
                                            ['adi_order', 'ASC'],
                                        ],
                                    });
                                    res.status(200).send({
                                        message: 'Archivos cargados correctamente',
                                        archivos_main
                                    });
                                }
                            });
                        });
                    });

                        
                }
                else if(req.files.length == 2)
                {   
                    await fs.readdir(DIR + 'temp', async function(err, archivos)
                    {
                        if(err)
                        {
                            onerror(err);
                            return;
                        }
                        await archivos.forEach(async function(archivo, indexArchivo)
                        {
                            await req.files.forEach(async function(archivoUpload, indexUpload)
                            {
                                if(archivo == archivoUpload.filename)
                                {
                                    if(await !fs.existsSync(DIR + tipo_imagen.dataValues.cmm_valor))
                                    {
                                        await fs.promises.mkdir(DIR + tipo_imagen.dataValues.cmm_valor, 
                                        { 
                                            recursive: true 
                                        });
                                    }
                                    if(await fs.existsSync(DIR + tipo_imagen.dataValues.cmm_valor))
                                    {
                                        await fs.rename(DIR + 'temp' +  '/' + archivo, DIR + tipo_imagen.dataValues.cmm_valor + '/' + tipo_imagen.dataValues.cmm_valor + '_' + archivo, async function(err)
                                        {
                                        });
                                    }
                                }
                                
                            });
                        });

                    });


                    const nuevoFile = await models.ArchivosDeInicio.create({
                        adi_nombre_archivo: String(req.files[0].filename),
                        adi_ruta_archivo: String( DIR + tipo_imagen.dataValues.cmm_valor + '/' + tipo_imagen.dataValues.cmm_valor + '_'+ req.files[0].filename),
                        adi_ruta_archivo_2: String( DIR + tipo_imagen.dataValues.cmm_valor + '/' + tipo_imagen.dataValues.cmm_valor + '_'+ req.files[1].filename),
                        adi_titulo: !!req.body.adi_titulo ? String(req.body.adi_titulo) : null,
                        adi_titulo_2: !!req.body.adi_titulo_2 ? String(req.body.adi_titulo_2) : null,
                        adi_descripcion: !!req.body.adi_descripcion ? String(req.body.adi_descripcion) : null,
                        adi_url:  !!req.body.adi_url ? String(req.body.adi_url) : null,
                        adi_cmm_tipo_id: Number(tipo_imagen.dataValues.cmm_control_id),
                        adi_cmm_estatus_id: Number(statusControllers.ESTATUS_ARCHIVO_MAIN.ACTIVO),
                        adi_usu_usuario_creador_id: Number(req.body.adi_usu_usuario_creador_id),
                        adi_order: !!req.body.adi_order ? req.body.adi_order : 0
                    });
                    

                    const archivos_main = await models.ArchivosDeInicio.findAll(
                    {
                        where: 
                        { 
                            adi_cmm_tipo_id: tipo_imagen.dataValues.cmm_control_id 
                        },
                        attributes: 
                        {
                            exclude: [
                                'adi_usu_usuario_creador_id',
                                'adi_usu_usuario_modificador_id',
                                'createdAt',
                                'updatedAt'
                            ]
                        },
                        include: [
                            {
                                model: models.ControlMaestroMultiple,
                                as: 'tipo_archivo_id',
                                attributes: {
                                    exclude: [
                                        'cmm_sistema',
                                        'cmm_activo',
                                        'cmm_usu_usuario_creado_por_id',
                                        'createdAt',
                                        'cmm_usu_usuario_modificado_por_id',
                                        'updatedAt'
                                    ]
                                }
                            },
                            {
                                model: models.ControlMaestroMultiple,
                                as: 'estatus_id',
                                attributes: {
                                    exclude: [
                                        'cmm_sistema',
                                        'cmm_activo',
                                        'cmm_usu_usuario_creado_por_id',
                                        'createdAt',
                                        'cmm_usu_usuario_modificado_por_id',
                                        'updatedAt'
                                    ]
                                }
                            }
                        ],
                        order: [
                            ['adi_order', 'ASC'],
                        ],
                    });
                    
                    res.status(200).send({
                        message: 'Archivos cargados correctamente',
                        archivos_main
                    });
                }
                


            }
            else
            {
                res.status(300).send(
                {
                    message: 'Lo sentimos, no se puede subir el archivo, no cumple con nuestros estandares'
                });
            }

        }


        catch(e)
        {
            res.status(500).send(
            {
                message: 'No fue posible cargar el/los archivos',
                e
            });
            next(e);
        }
    },
    //Cargas to main 
    cargaFileToMainOriginal: async(req, res, next) =>{
        try{
            console.log('\n ************************************************************************* REQBODY \n', req.body, req.files, '\n**************************************************************************************');
            const tipo_imagen = await models.ControlMaestroMultiple.findOne({
                where:{ 
                    cmm_control_id: req.body.adi_cmm_tipo_id,
                    cmm_nombre: 'TIPO_ARCHIVO_MAIN'
                }
            });
            if(!!tipo_imagen){
                await fs.readdir(DIR + 'temp', async function(err, archivos){
                    if(err){
                        onerror(err);
                        return;
                    }
                    archivos.forEach(async function(archivo, indexArchivo){
                        req.files.forEach(async function(archivoUpload, indexUpload){
                            if(archivo == archivoUpload.filename){
                                if(!fs.existsSync(DIR + tipo_imagen.dataValues.cmm_valor)){
                                    await fs.promises.mkdir(DIR + tipo_imagen.dataValues.cmm_valor, { 
                                        recursive: true 
                                    });
                                }
                                if(fs.existsSync(DIR + tipo_imagen.dataValues.cmm_valor)){
                                    await fs.rename(DIR + 'temp' +  '/' + archivo, DIR + tipo_imagen.dataValues.cmm_valor + '/' + tipo_imagen.dataValues.cmm_valor + '_' + archivo, async function(err){
                                        const nuevoFile = await models.ArchivosDeInicio.create({
                                            adi_nombre_archivo: String(archivo),
                                            adi_ruta_archivo: String( DIR + tipo_imagen.dataValues.cmm_valor + '/' + tipo_imagen.dataValues.cmm_valor + '_'+ archivo),
                                            adi_titulo: !!req.body.adi_titulo ? String(req.body.adi_titulo) : null,
                                            adi_descripcion: !!req.body.adi_descripcion ? String(req.body.adi_descripcion) : null,
                                            adi_url:  !!req.body.adi_url ? String(req.body.adi_url) : null,
                                            adi_cmm_tipo_id: Number(tipo_imagen.dataValues.cmm_control_id),
                                            adi_cmm_estatus_id: Number(statusControllers.ESTATUS_ARCHIVO_MAIN.ACTIVO),
                                            adi_usu_usuario_creador_id: Number(req.body.adi_usu_usuario_creador_id),
                                            adi_order: !!req.body.adi_order ? req.body.adi_order : 0
                                        });
                                        return console.log('File move success!');
                                    });
                                }
                            }
                            if(((archivos.length - 1) == indexArchivo) && ((req.files.length -1) == indexUpload)){
                                const archivos_main = await models.ArchivosDeInicio.findAll({
                                    where: { 
                                        adi_cmm_tipo_id: tipo_imagen.dataValues.cmm_control_id 
                                    },
                                    attributes: {
                                        exclude: [
                                            'adi_usu_usuario_creador_id',
                                            'adi_usu_usuario_modificador_id',
                                            'createdAt',
                                            'updatedAt'
                                        ]
                                    },
                                    include: [
                                        {
                                            model: models.ControlMaestroMultiple,
                                            as: 'tipo_archivo_id',
                                            attributes: {
                                                exclude: [
                                                    'cmm_sistema',
                                                    'cmm_activo',
                                                    'cmm_usu_usuario_creado_por_id',
                                                    'createdAt',
                                                    'cmm_usu_usuario_modificado_por_id',
                                                    'updatedAt'
                                                ]
                                            }
                                        },
                                        {
                                            model: models.ControlMaestroMultiple,
                                            as: 'estatus_id',
                                            attributes: {
                                                exclude: [
                                                    'cmm_sistema',
                                                    'cmm_activo',
                                                    'cmm_usu_usuario_creado_por_id',
                                                    'createdAt',
                                                    'cmm_usu_usuario_modificado_por_id',
                                                    'updatedAt'
                                                ]
                                            }
                                        }
                                    ],
                                    order: [
                                        ['adi_order', 'ASC'],
                                    ],
                                });
                                res.status(200).send({
                                    message: 'Archivos cargados correctamente',
                                    archivos_main
                                });
                            }
                        });
                    });
                });
            }else{
                res.status(300).send({
                    message: 'Lo sentimos, no se puede subir el archivo, no cumple con nuestros estandares'
                });
            }
        }catch(e){
            res.status(500).send({
                message: 'No fue posible cargar el/los archivos',
                e
            });
            next(e);
        }
    },
    getArchivoByType: async(req, res, next) =>{
        try{
            const control = await models.ControlMaestroMultiple.findOne({
                where: {
                    cmm_valor: req.params.type
                }
            })
            if(!!control){
                const archivos_main = await models.ArchivosDeInicio.findAll({
                    where: { 
                        adi_cmm_tipo_id: control.dataValues.cmm_control_id
                    },
                    attributes: {
                        exclude: [
                            'adi_usu_usuario_creador_id',
                            'adi_usu_usuario_modificador_id',
                            'createdAt',
                            'updatedAt'
                        ]
                    },
                    include: [
                        {
                            model: models.ControlMaestroMultiple,
                            as: 'tipo_archivo_id',
                            attributes: {
                                exclude: [
                                    'cmm_sistema',
                                    'cmm_activo',
                                    'cmm_usu_usuario_creado_por_id',
                                    'createdAt',
                                    'cmm_usu_usuario_modificado_por_id',
                                    'updatedAt'
                                ]
                            }
                        },
                        {
                            model: models.ControlMaestroMultiple,
                            as: 'estatus_id',
                            attributes: {
                                exclude: [
                                    'cmm_sistema',
                                    'cmm_activo',
                                    'cmm_usu_usuario_creado_por_id',
                                    'createdAt',
                                    'cmm_usu_usuario_modificado_por_id',
                                    'updatedAt'
                                ]
                            }
                        }
                    ],
                    order: [
                        ['adi_order', 'ASC'],
                    ]
                });
                if(!!archivos_main){
                    res.status(200).send({
                        message: 'Archivos cargados correctamente',
                        archivos_main
                    });
                }else{
                    res.status(300).send({
                        message: 'Categoría actualmente vacia o nula'
                    })
                }
            }else{
                res.status(300).send({
                    message: 'Esta categoría no existe o no es valida'
                })
            }
        }catch(e){
            res.status(500).send({
                message: 'Error al  obtener archivos',
                e
            });
            next(e);
        }
    },
    updateStatusFile: async (req, res, next) =>{
        try{
            const fileActual = await models.ArchivosDeInicio.findOne({
                where: {
                    adi_archivo_de_inicio_id: req.body.adi_archivo_de_inicio_id,
                    adi_cmm_estatus_id: { [Op.ne] : statusControllers.ESTATUS_ARCHIVO_MAIN.ELIMINADO }
                }
            });
            if(!!fileActual){
                await fileActual.update({
                    adi_cmm_estatus_id: !!req.body.adi_cmm_estatus_id ? req.body.adi_cmm_estatus_id : fileActual.dataValues.adi_cmm_estatus_id,
                    adi_usu_usuario_modificador_id: !!req.body.adi_usu_usuario_modificador_id ? req.body.adi_usu_usuario_modificador_id : fileActual.dataValues.adi_usu_usuario_modificador_id,
                    updateAt: Date(),
                    adi_titulo: !!req.body.adi_titulo ? req.body.adi_titulo : fileActual.dataValues.adi_titulo,
                    adi_descripcion: !!req.body.adi_descripcion ? req.body.adi_descripcion : fileActual.dataValues.adi_descripcion,
                    adi_url: !!req.body.adi_url ? req.body.adi_url : fileActual.dataValues.adi_url,
                    adi_order: !!req.body.adi_order ? req.body.adi_order : fileActual.dataValues.adi_order
                });
                res.status(200).send({
                    message: 'Estaus de archivo'
                });
            }else{
                res.status(300).send({
                    message: 'Archivo, no existente'
                })
            }
        }catch(e){
            res.status(500).send({
                message: 'Error, al actualizar el status del archivo',
                e
            });
            next(e);
        }
    },
    deleteFileOfHome: async(req, res, next) =>{
        try{
            
            const fileActual = await models.ArchivosDeInicio.findOne({
                where: {
                    adi_archivo_de_inicio_id: req.body.adi_archivo_de_inicio_id
                }
            });
            if(!!fileActual){
                const control = await models.ControlMaestroMultiple.findOne({
                    where: {
                        cmm_control_id: fileActual.dataValues.adi_cmm_tipo_id
                    }
                });
                if(!!control){
                    const nombreCarpeta = control.dataValues.cmm_valor;
                    console.log('NOMBRE CARPETA', nombreCarpeta, fileActual.dataValues.adi_nombre_archivo, '\nCARPETA', DIR + nombreCarpeta + '/' + fileActual.dataValues.adi_nombre_archivo);
                    await fs.unlink(DIR + nombreCarpeta + '/' + nombreCarpeta + '_' + fileActual.dataValues.adi_nombre_archivo, async function(err){
                        if(err){
                            onerror(err);
                            return;
                        }
                        console.log('File delte success!');
                        await models.ArchivosDeInicio.destroy({
                            where: {
                                adi_archivo_de_inicio_id: fileActual.dataValues.adi_archivo_de_inicio_id
                            }
                        });
                    })
                    res.status(200).send({
                        message: 'Eliminación correcta'
                    });
                }else{
                    res.status(300).send({
                        message: 'Error, no se pudo localizar el archivo'
                    })
                }
            }else{
                res.status(300).send({
                    message: 'Archivo, no existente'
                })
            }
        }catch(e){
            res.status(500).send({
                message: 'Error al eliminar el archivo',
                e
            });
            next(e);
        }
    },
    uploadFileSolicitudDeCredito: async(req, res, next) => {
        try{

            const socio_de_negocio = await models.SociosNegocio.findOne({
                where: {
                    sn_socios_negocio_id: req.body.sn_socios_negocio_id
                }
            });

            
            const archivoExistente = await models.ArchivosDeInicio.findOne({
                where : {
                    adi_sn_socio_de_negocio_id: req.body.sn_socios_negocio_id,
                    adi_sdc_solicitud_de_credito_id: req.body.adi_sdc_solicitud_de_credito_id
                }
            });

            if(!!archivoExistente){
                console.log(`${__dirname}\\.` + archivoExistente.dataValues.adi_ruta_archivo + ``);
                await fs.unlink(`${__dirname}\\.` + archivoExistente.dataValues.adi_ruta_archivo + `` , async function(err){
                    if(err){
                        onerror(err);
                        return;
                    }
                    console.log('File delte success!');
                    await models.ArchivosDeInicio.destroy({
                        where : {
                            adi_sn_socio_de_negocio_id: req.body.sn_socios_negocio_id,
                            adi_sdc_solicitud_de_credito_id: req.body.adi_sdc_solicitud_de_credito_id
                        }
                    });
                })
            }
            if(!!socio_de_negocio){
                await fs.readdir(DIRAR, async function(err, archivos){
                    if(err){
                        onerror(err);
                        return;
                    }
                    archivos.forEach(async function(archivo, indexArchivo){
                        req.files.forEach(async function(archivoUpload, indexUpload){
                            if(archivo == archivoUpload.filename){
                                console.log('Concuerda', archivo, archivoUpload.filename);
                                if(!!socio_de_negocio.dataValues.sn_socios_negocio_id){
                                    if(!fs.existsSync(PRIVATE_SOLICITUD + '_' +socio_de_negocio.dataValues.sn_socios_negocio_id)){
                                        await fs.promises.mkdir(PRIVATE_SOLICITUD + '_' + socio_de_negocio.dataValues.sn_socios_negocio_id, { 
                                            recursive: true 
                                        });
                                    }
                                    if(fs.existsSync(PRIVATE_SOLICITUD + socio_de_negocio.dataValues.sn_socios_negocio_id)){
                                        await fs.rename(DIRAR +  '/' + archivo, PRIVATE_SOLICITUD + '_' + socio_de_negocio.dataValues.sn_socios_negocio_id + '/' + socio_de_negocio.dataValues.sn_socios_negocio_id + '_' + archivo, async function(err){
                                            const nuevoFile = await models.ArchivosDeInicio.create({
                                                adi_nombre_archivo: String(archivo),
                                                adi_ruta_archivo: String( PRIVATE_SOLICITUD + '_' + socio_de_negocio.dataValues.sn_socios_negocio_id + '/' + socio_de_negocio.dataValues.sn_socios_negocio_id + '_'+ archivo),
                                                adi_titulo: 'Solicitud_de_credito_' + String(socio_de_negocio.dataValues.sn_socios_negocio_id),
                                                adi_cmm_tipo_id: Number(statusControllers.TIPO_ARCHIVO.SOLICITUD_DE_CREDITO),
                                                adi_cmm_estatus_id: Number(statusControllers.ESTATUS_ARCHIVOS.ACTIVO),
                                                adi_sn_socio_de_negocio_id: Number(socio_de_negocio.dataValues.sn_socios_negocio_id),
                                                adi_sdc_solicitud_de_credito_id: req.body.adi_sdc_solicitud_de_credito_id
                                            });
                                            return console.log('File move success!');
                                        });
                                    }
                                }
                            }
                            if(((archivos.length - 1) == indexArchivo) && ((req.files.length -1) == indexUpload)){
                                res.status(200).send({
                                    message: 'Archivos cargados correctamente'
                                });

                            }
                        });
                    });
                });
            }else{
                res.status(300).send({
                    message: 'Producto no existe y/o no esta disponible.'
                })
            }
        }catch(e){
            res.status(500).send({
                message: 'Error al cargar archivos y crear la solicitud de credito',
                e
            });
            next(e);
        }
    },
    downloadFile: async(req, res, next) =>{
        try{
            const ruta = await models.ArchivosDeInicio.findOne({
                where : {
                    adi_sn_socio_de_negocio_id: req.body.adi_sn_socio_de_negocio_id,
                    adi_sdc_solicitud_de_credito_id: req.body.adi_sdc_solicitud_de_credito_id
                }
            });
            console.log(ruta);
            if(!!ruta){
                const file = `${__dirname}\\.` + ruta.dataValues.adi_ruta_archivo + ``;

                console.log('FILE', file);
                res.download(file);
            }else{
                res.status(300).send({
                    message: 'Error, archivo no encontrado o no disponible'
                });
            }
        }catch(e){
            res.status(500).send({
                message: 'Error al descargar el archivo',
                e
            });
            next(e);
        }
    },
    fileExcelUpladOriginal: async (req, res, next)=>{
        try{
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
                                    if(sheet_name_list[i] == "Plantilla de Datos")
                                    {
                                        numPlantillaViñetas = i
                                        break
                                    }
                                }


                                var xlData = XLSX.utils.sheet_to_json(workbook.Sheets[sheet_name_list[numPlantillaViñetas]]);



                                //AGREGAR JSONS POR SKU
                                for (var i = 0; i < xlData.length; i++) 
                                {   
                                    console.log(xlData[i].SKU)
                                    const productoUpdate = await models.Producto.findOne({
                                        where: {
                                            prod_sku: xlData[i].SKU
                                        }
                                    });

                                    if(productoUpdate)
                                    {
                                        //OBTENER INFORMACION PADRE
                                        var ProductoID = productoUpdate.prod_producto_id
                                        var ProductoPadre = productoUpdate.prod_prod_producto_padre_sku

                                        const constproductoPadre = await models.Producto.findOne({
                                            where: {
                                                prod_sku: ProductoPadre
                                            }
                                        });


                                        //Actualizar Padre meta titulo y descripcion
                                        var bodyUpdatePadre = {
                                            "prod_meta_titulo": xlData[i].Meta_titulo,
                                            "prod_meta_descripcion": xlData[i].Meta_descripcion,
                                            updatedAt: Date()
                                        }

                                        await constproductoPadre.update(bodyUpdatePadre);
                                        //Fin Actualizar Padre meta titulo y descripcion



                                        var ProductoPadreID = constproductoPadre.prod_producto_id

                                        //Settear variable de atributos
                                        var variation_theme = xlData[i].variation_theme

                                        if(typeof variation_theme !== 'undefined' && variation_theme)
                                        {
                                            //Convertir variable en mayusculas
                                            variation_theme = variation_theme.toUpperCase()

                                            //Separa en variable
                                            var spliter = variation_theme.split(',')
                                            
                                            for (var y = 0; y < spliter.length; y++) 
                                            {
                                                //Se asigna el atributo [ALGO] en una variable para buscarse    
                                                    var AtributoUsar = spliter[y].trim()
                                                    
                                                    const constAtributo = await models.Atributo.findOne({
                                                        where: {
                                                            at_nombre: AtributoUsar
                                                        }
                                                    });

                                                    if(!constAtributo)
                                                    {
                                                        const bodyCreate = {
                                                            "at_nombre" : AtributoUsar,
                                                            "at_descripcion" :  "",
                                                            "at_usu_usuario_creador_id":  1,   
                                                            "at_cmm_estatus_id": statusControles.ESTATUS_ATRIBUTO.ACTIVO
                                                        };

                                                        console.log(bodyCreate)
                                                             
                                                        await models.Atributo.create(bodyCreate);
                                                    }



                                                //REPETIR CODIGO PORQUE SI NO VIENE DESDE UN INICIO, SETTEARLA EN EL IF AVECES DA PROBLEMAS DE EJECUCION.
                                                    const constAtributeVariable = await models.Atributo.findOne({
                                                        where: {
                                                            at_nombre: AtributoUsar
                                                        }
                                                    });

                                                    var AtributoID = constAtributeVariable.at_atributo_id;



                                                //BUSCAR RELACION ATRIBUTO PADRE (PARA LUEGO UTILIZAR EL ID RELACION CON EL SKU HIJO)
                                                    const constAtributoProductos = await models.AtributoProductos.findOne({
                                                        where: {
                                                            atp_id_atributo: AtributoID,
                                                            atp_id_producto: ProductoPadreID,
                                                            atp_cmm_estatus_id: { [Op.ne] : statusControles.ATRIBUTO_PRODUCTO.ELIMINADA }
                                                        }
                                                    });

                                                //Si no existe la relacion se creara
                                                    if(!constAtributoProductos)
                                                    {
                                                        const bodyCreate = {
                                                            "atp_id_atributo" : AtributoID,
                                                            "atp_id_producto" :  ProductoPadreID,
                                                            "atp_usu_usuario_creador_id":  1,   
                                                            "atp_cmm_estatus_id": statusControles.ATRIBUTO_PRODUCTO.ACTIVO
                                                        };
                                                             
                                                        await models.AtributoProductos.create(bodyCreate);
                                                    }
                                                

                                                //volver a buscar el id de la relacion porque si no fallara en caso de que no existia al inicio
                                                    const constAtributoProductosID = await models.AtributoProductos.findOne({
                                                        where: {
                                                            atp_id_atributo: AtributoID,
                                                            atp_id_producto: ProductoPadreID,
                                                            atp_cmm_estatus_id: { [Op.ne] : statusControles.ATRIBUTO_PRODUCTO.ELIMINADA }
                                                        }
                                                    });

                                                    var ProductoAtributoID = constAtributoProductosID.atp_atributo_producto_id
                                                
                                                
                                                //Busca si ya existe el valor del sku y si no crearlo, si si actualizarlo    
                                                const constAtributoSkuValores = await models.AtributoSkuValores.findOne({
                                                    where: {
                                                        skuav_id_atributo_producto: ProductoAtributoID,
                                                        skuav_id_sku: ProductoID,
                                                        skuav_cmm_estatus_id: { [Op.ne] : statusControles.ATRIBUTO_SKU_VALOR.ELIMINADA }
                                                    }
                                                });

                                                //settear columna de la cual tomar el valor de la variacion atributo
                                                var valorFromColumnExcel = ''


                                                //OBTENER VALOR
                                                var valorAtributoSKU = ''
                                                if(y == 0)
                                                {
                                                    valorAtributoSKU = xlData[i].Variacion_1
                                                }
                                                else if(y == 1)
                                                {
                                                    valorAtributoSKU = xlData[i].Variacion_2
                                                }
                                                else if(y == 2)
                                                {
                                                    valorAtributoSKU = xlData[i].Variacion_3
                                                }
                                                else if(y == 3)
                                                {
                                                    valorAtributoSKU = xlData[i].Variacion_4
                                                }

                
                                                if(typeof valorAtributoSKU !== 'undefined' && valorAtributoSKU)
                                                {   
                                                    console.log(9889898989)
                                                    //AGREGAR O UPDATE A LA TABLA VALORES ATRIBUTOS
                                                    if(constAtributoSkuValores)
                                                    {
                                                        const bodyUpdate = {
                                                            "skuav_valor":  valorAtributoSKU.toString().toUpperCase(),   
                                                            "skuav_usu_usuario_modificador_id": 1,
                                                            updatedAt: Date()
                                                        }
                                                        await constAtributoSkuValores.update(bodyUpdate);
                                                    }
                                                    else
                                                    {
                                                        console.log(54545455)
                                                        const bodyCreate = {
                                                            "skuav_id_sku" : ProductoID,
                                                            "skuav_id_atributo_producto" :  ProductoAtributoID,
                                                            "skuav_valor":  valorAtributoSKU.toString().toUpperCase(),   
                                                            "skuav_cmm_estatus_id": statusControles.ATRIBUTO_SKU_VALOR.ACTIVO,
                                                            "skuav_usu_usuario_creador_id": 1
                                                        };
                                                        await models.AtributoSkuValores.create(bodyCreate);
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            //Fin cargar atributos d producto




















                            //AGREGAR JSONS POR SKU
                                for (var i = 0; i < xlData.length; i++) 
                                {   
                                    const productoUpdate = await models.Producto.findOne({
                                        where: {
                                            prod_sku: xlData[i].SKU
                                        }
                                    });

                                    if(productoUpdate)
                                    {
                                        //Viñetas
                                            var arrayVinetas = [];

                                            if(xlData[i].Viñeta != null && xlData[i].Viñeta != '')
                                            {
                                                var agregar = {
                                                    Viñeta: xlData[i].Viñeta
                                                }

                                                arrayVinetas.push(agregar)
                                            }

                                            if(xlData[i].Viñeta_1 != null && xlData[i].Viñeta_1 != '')
                                            {
                                                var agregar = {
                                                    Viñeta_1: xlData[i].Viñeta_1
                                                }

                                                arrayVinetas.push(agregar)
                                            }

                                            if(xlData[i].Viñeta_2 != null && xlData[i].Viñeta_2 != '')
                                            {
                                                var agregar = {
                                                    Viñeta_2: xlData[i].Viñeta_2
                                                }

                                                arrayVinetas.push(agregar)
                                            }

                                            if(xlData[i].Viñeta_3 != null && xlData[i].Viñeta_3 != '')
                                            {
                                                var agregar = {
                                                    Viñeta_3: xlData[i].Viñeta_3
                                                }

                                                arrayVinetas.push(agregar)
                                            }

                                            if(xlData[i].Viñeta_4 != null && xlData[i].Viñeta_4 != '')
                                            {
                                                var agregar = {
                                                    Viñeta_4: xlData[i].Viñeta_4
                                                }

                                                arrayVinetas.push(agregar)
                                            }

                                            arrayVinetas = JSON.stringify(arrayVinetas);
                                        //Fin Viñetas



                                        //Caracteristicas Tecnicas
                                            var arrayCaracteristicasTecnicas = [];

                                            if(xlData[i].Nombre_de_Caracteristica_Tecnica_1 != null && xlData[i].Nombre_de_Caracteristica_Tecnica_1 != '' 
                                                && xlData[i].Valor_de_Caracteristica_Tecnica_1 != null && xlData[i].Valor_de_Caracteristica_Tecnica_1 != '')
                                            {

                                                var nombre1 = xlData[i].Nombre_de_Caracteristica_Tecnica_1
                                                var agregar = "{"+nombre1+": "+xlData[i].Valor_de_Caracteristica_Tecnica_1+"}"

                                                arrayCaracteristicasTecnicas.push(agregar)
                                            }

                                            if(xlData[i].Nombre_de_Caracteristica_Tecnica_2 != null && xlData[i].Nombre_de_Caracteristica_Tecnica_2 != '' 
                                                && xlData[i].Valor_de_Caracteristica_Tecnica_2 != null && xlData[i].Valor_de_Caracteristica_Tecnica_2 != '')
                                            {
                                                var nombre2 = xlData[i].Nombre_de_Caracteristica_Tecnica_2
                                                var agregar = "{"+nombre2+": "+xlData[i].Valor_de_Caracteristica_Tecnica_2+"}"

                                                arrayCaracteristicasTecnicas.push(agregar)
                                            }

                                            if(xlData[i].Nombre_de_Caracteristica_Tecnica_3 != null && xlData[i].Nombre_de_Caracteristica_Tecnica_3 != '' 
                                                && xlData[i].Valor_de_Caracteristica_Tecnica_3 != null && xlData[i].Valor_de_Caracteristica_Tecnica_3 != '')
                                            {
                                                var nombre3 = xlData[i].Nombre_de_Caracteristica_Tecnica_3
                                                var agregar = "{"+nombre3+": "+xlData[i].Valor_de_Caracteristica_Tecnica_3+"}"

                                                arrayCaracteristicasTecnicas.push(agregar)
                                            }

                                            if(xlData[i].Nombre_de_Caracteristica_Tecnica_4 != null && xlData[i].Nombre_de_Caracteristica_Tecnica_4 != '' 
                                                && xlData[i].Valor_de_Caracteristica_Tecnica_4 != null && xlData[i].Valor_de_Caracteristica_Tecnica_4 != '')
                                            {
                                                var nombre4 = xlData[i].Nombre_de_Caracteristica_Tecnica_4
                                                var agregar = "{"+nombre4+": "+xlData[i].Valor_de_Caracteristica_Tecnica_4+"}"

                                                arrayCaracteristicasTecnicas.push(agregar)
                                            }

                                            if(xlData[i].Nombre_de_Caracteristica_Tecnica_5 != null && xlData[i].Nombre_de_Caracteristica_Tecnica_5 != '' 
                                                && xlData[i].Valor_de_Caracteristica_Tecnica_5 != null && xlData[i].Valor_de_Caracteristica_Tecnica_5 != '')
                                            {
                                                var nombre5 = xlData[i].Nombre_de_Caracteristica_Tecnica_5
                                                var agregar = "{"+nombre5+": "+xlData[i].Valor_de_Caracteristica_Tecnica_5+"}"

                                                arrayCaracteristicasTecnicas.push(agregar)
                                            }

                                            if(xlData[i].Nombre_de_Caracteristica_Tecnica_6 != null && xlData[i].Nombre_de_Caracteristica_Tecnica_6 != '' 
                                                && xlData[i].Valor_de_Caracteristica_Tecnica_6 != null && xlData[i].Valor_de_Caracteristica_Tecnica_6 != '')
                                            {
                                                var nombre6 = xlData[i].Nombre_de_Caracteristica_Tecnica_6
                                                var agregar = "{"+nombre6+": "+xlData[i].Valor_de_Caracteristica_Tecnica_6+"}"

                                                arrayCaracteristicasTecnicas.push(agregar)
                                            }

                                            if(xlData[i].Nombre_de_Caracteristica_Tecnica_7 != null && xlData[i].Nombre_de_Caracteristica_Tecnica_7 != '' 
                                                && xlData[i].Valor_de_Caracteristica_Tecnica_7 != null && xlData[i].Valor_de_Caracteristica_Tecnica_7 != '')
                                            {
                                                var nombre7 = xlData[i].Nombre_de_Caracteristica_Tecnica_7
                                                var agregar = "{"+nombre7+": "+xlData[i].Valor_de_Caracteristica_Tecnica_7+"}"

                                                arrayCaracteristicasTecnicas.push(agregar)
                                            }

                                            arrayCaracteristicasTecnicas = JSON.stringify(arrayCaracteristicasTecnicas);
                                        //Fin Viñetas

                                        console.log(12365478)

                                        var descripcion = ""
                                        if(typeof xlData[i].Descripción !== 'undefined' && xlData[i].Descripción)
                                        { 
                                            descripcion = xlData[i].Descripción.toUpperCase()
                                        }
                                        
                                        var nombre_producto = ""
                                        if(typeof xlData[i].Título !== 'undefined' && xlData[i].Título)
                                        { 
                                            nombre_producto = xlData[i].Título.toUpperCase()
                                        }

                                        const bodyUpdate = {
                                            "prod_viñetas" : arrayVinetas, 
                                            "prod_descripcion": descripcion,
                                            "prod_nombre": nombre_producto,
                                            "prod_caracteristicas_tecnicas": arrayCaracteristicasTecnicas
                                        };
                                        await productoUpdate.update(bodyUpdate);

                                    }
                                }
                            //Fin agregar campos desde excel a producto
                        }



                        if(((archivos.length - 1) == indexArchivo) && ((req.files.length -1) == indexUpload)){
                            res.status(200).send({
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
    fileExcelUplad: async (req, res, next)=>{
        try{
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
                                    if(sheet_name_list[i] == "Plantilla de Datos")
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
                                    console.log(xlData[i].SKU)
                                    const productoUpdate = await models.Producto.findOne({
                                        where: {
                                            prod_sku: xlData[i].SKU
                                        }
                                    });

                                    //Si existe hijo
                                    if(productoUpdate)
                                    {
                                        //obtener info padre
                                        var ProductoID = productoUpdate.prod_producto_id
                                        var ProductoPadre = productoUpdate.prod_prod_producto_padre_sku

                                        const constproductoPadre = await models.Producto.findOne({
                                            where: {
                                                prod_sku: ProductoPadre
                                            }
                                        });

                                        //Actualizar Padre meta titulo y descripcion
                                            var bodyUpdatePadre = {
                                                "prod_meta_titulo": xlData[i].Meta_titulo,
                                                "prod_meta_descripcion": xlData[i].Meta_descripcion,
                                                updatedAt: Date()
                                            }

                                            await constproductoPadre.update(bodyUpdatePadre);
                                        //Fin Actualizar Padre meta titulo y descripcion


                                        //Settear el id de padre para la tabla atributos
                                        var ProductoPadreID = constproductoPadre.prod_producto_id

                                        //Settear variable de atributos
                                        var variation_theme = xlData[i].variation_theme

                                        if(typeof variation_theme !== 'undefined' && variation_theme)
                                        {
                                            //Convertir el campo de variation theme en mayusculas
                                            variation_theme = variation_theme.toUpperCase()

                                            //Separa por palabras las variaciones
                                            var spliter = variation_theme.split(',')
                                            









                                            //BORRAR TODOS LOS ATTRIBUTOS QUE NO VENGAN (ESTO BORRA ATTRIBUTOS DE PADRES Y DE TODOS LOS HIJOS QUE ESTEN ASIGNADOS)
                                            //Obtener los atributos del padre
                                            const constProductosPadreTotalAtributos = await models.AtributoProductos.findAll({
                                                where: {
                                                    atp_id_producto: ProductoPadreID
                                                }
                                            });
                                            console.log(constProductosPadreTotalAtributos)

                                            
                                            //Hacer un in para obtener todos los variathion theme id y compararlos
                                            var variation_theme_query_in = ''
                                            for (var x = 0; x < spliter.length; x++) 
                                            { 
                                                if(x == spliter.length-1)
                                                {
                                                    variation_theme_query_in = variation_theme_query_in + "'" + spliter[x].trim() + "'"
                                                }
                                                else
                                                {
                                                    variation_theme_query_in = variation_theme_query_in + "'" + spliter[x].trim() + "',"
                                                }
                                            }
                                            console.log(variation_theme_query_in)


                                            //OBTIENE EL TOTAL DEL COUNT
                                            const variation_theme_ID_query = await sequelize.query
                                            (`
                                                select
                                                    at_atributo_id,
                                                    at_nombre
                                                from 
                                                    atributos
                                                where 
                                                    at_nombre in (`+variation_theme_query_in+`)
                                                `,
                                            { 
                                                type: sequelize.QueryTypes.SELECT 
                                            });
                                            console.log(variation_theme_ID_query.length)

                                            var AtributosBorrarArray = []
                                            //Comparar atributos que tiene el padre con el del excel
                                            for (var h = 0; h < constProductosPadreTotalAtributos.length; h++) 
                                            {   
                                                var existe = false
                                                for (var g = 0; g < variation_theme_ID_query.length; g++) 
                                                {
                                                    if(constProductosPadreTotalAtributos[h].dataValues.atp_id_atributo == variation_theme_ID_query[g].at_atributo_id)
                                                    {
                                                        existe = true
                                                    }
                                                }   
                                                if(existe == false)
                                                {
                                                    AtributosBorrarArray.push(constProductosPadreTotalAtributos[h].dataValues.atp_id_atributo)
                                                }
                                            }
                                            console.log(AtributosBorrarArray)





                                            //Destruir Hijos que tengan asignados atributos que no vengan en excel
                                            for (var k = 0; k < AtributosBorrarArray.length; k++) 
                                            {  

                                                //Obtener todos los id de la relacion attrprod-skuvalores
                                                const idsAEliminar = await models.AtributoProductos.findAll({
                                                    where: {
                                                        atp_id_atributo: AtributosBorrarArray[k],
                                                        atp_id_producto: ProductoPadreID
                                                    }
                                                });
                                                console.log(idsAEliminar.length)

                                                //Hacer un in para obtener todos los id de relacion atributosProductos-SKUVALORES
                                                var in2 = ''
                                                for (var j = 0; j < idsAEliminar.length; j++) 
                                                { 
                                                    if(j == idsAEliminar.length-1)
                                                    {
                                                        in2 = in2 + "'" + idsAEliminar[j].dataValues.atp_atributo_producto_id + "'"
                                                    }
                                                    else
                                                    {
                                                        in2 = in2 + "'" + idsAEliminar[j].dataValues.atp_atributo_producto_id + "',"
                                                    }
                                                }
                                                console.log(in2)

                                                const DeleteHijosAtributos = await sequelize.query
                                                (`
                                                    delete 
                                                    from sku_atributos_valores 
                                                    where 
                                                        skuav_id_atributo_producto in (`+in2+`)
                                                    `,
                                                { 
                                                    type: sequelize.QueryTypes.DELETE 
                                                });

                                                //BORRAR EL ATTRIBUTO DEL PADRE
                                                const DeletePadresAtributos = await sequelize.query
                                                (`
                                                    delete 
                                                    from atributos_productos 
                                                    where 
                                                        atp_id_atributo = `+ AtributosBorrarArray[k] +` 
                                                        and atp_id_producto = `+ ProductoPadreID +`
                                                    `,
                                                { 
                                                    type: sequelize.QueryTypes.DELETE 
                                                });
                                            }







                                            // // Actualizar o crear attributos
                                            for (var y = 0; y < spliter.length; y++) 
                                            {
                                                //Se asigna el atributo [ALGO] en una variable para buscarse    
                                                    var AtributoUsar = spliter[y].trim()
                                                    
                                                    //Obtener atributo
                                                    const constAtributo = await models.Atributo.findOne({
                                                        where: {
                                                            at_nombre: AtributoUsar
                                                        }
                                                    });

                                                    if(!constAtributo)
                                                    {
                                                        const bodyCreate = {
                                                            "at_nombre" : AtributoUsar,
                                                            "at_descripcion" :  "",
                                                            "at_usu_usuario_creador_id":  1,   
                                                            "at_cmm_estatus_id": statusControles.ESTATUS_ATRIBUTO.ACTIVO
                                                        };

                                                        console.log(bodyCreate)
                                                             
                                                        await models.Atributo.create(bodyCreate);
                                                    }



                                                //REPETIR CODIGO PORQUE SI NO VIENE DESDE UN INICIO, SETTEARLA EN EL IF AVECES DA PROBLEMAS DE EJECUCION.
                                                    const constAtributeVariable = await models.Atributo.findOne(
                                                    {
                                                        where: {
                                                            at_nombre: AtributoUsar
                                                        }
                                                    });

                                                    var AtributoID = constAtributeVariable.at_atributo_id;



                                                //BUSCAR RELACION ATRIBUTO PADRE (PARA LUEGO UTILIZAR EL ID RELACION CON EL SKU HIJO)
                                                    const constAtributoProductos = await models.AtributoProductos.findOne({
                                                        where: {
                                                            atp_id_atributo: AtributoID,
                                                            atp_id_producto: ProductoPadreID,
                                                            atp_cmm_estatus_id: { [Op.ne] : statusControles.ATRIBUTO_PRODUCTO.ELIMINADA }
                                                        }
                                                    });

                                                //Si no existe la relacion se creara
                                                    if(!constAtributoProductos)
                                                    {
                                                        const bodyCreate = {
                                                            "atp_id_atributo" : AtributoID,
                                                            "atp_id_producto" :  ProductoPadreID,
                                                            "atp_usu_usuario_creador_id":  1,   
                                                            "atp_cmm_estatus_id": statusControles.ATRIBUTO_PRODUCTO.ACTIVO
                                                        };
                                                             
                                                        await models.AtributoProductos.create(bodyCreate);
                                                    }
                                                

                                                //volver a buscar el id de la relacion porque si no fallara en caso de que no existia al inicio
                                                    const constAtributoProductosID = await models.AtributoProductos.findOne({
                                                        where: {
                                                            atp_id_atributo: AtributoID,
                                                            atp_id_producto: ProductoPadreID,
                                                            atp_cmm_estatus_id: { [Op.ne] : statusControles.ATRIBUTO_PRODUCTO.ELIMINADA }
                                                        }
                                                    });

                                                    var ProductoAtributoID = constAtributoProductosID.atp_atributo_producto_id
                                                
                                                
                                                //Busca si ya existe el valor del sku y si no crearlo, si si actualizarlo    
                                                const constAtributoSkuValores = await models.AtributoSkuValores.findOne({
                                                    where: {
                                                        skuav_id_atributo_producto: ProductoAtributoID,
                                                        skuav_id_sku: ProductoID,
                                                        skuav_cmm_estatus_id: { [Op.ne] : statusControles.ATRIBUTO_SKU_VALOR.ELIMINADA }
                                                    }
                                                });

                                                //settear columna de la cual tomar el valor de la variacion atributo
                                                var valorFromColumnExcel = ''


                                                //OBTENER VALOR
                                                var valorAtributoSKU = ''
                                                if(y == 0)
                                                {
                                                    valorAtributoSKU = xlData[i].Variacion_1
                                                }
                                                else if(y == 1)
                                                {
                                                    valorAtributoSKU = xlData[i].Variacion_2
                                                }
                                                else if(y == 2)
                                                {
                                                    valorAtributoSKU = xlData[i].Variacion_3
                                                }
                                                else if(y == 3)
                                                {
                                                    valorAtributoSKU = xlData[i].Variacion_4
                                                }

                
                                                if(typeof valorAtributoSKU !== 'undefined' && valorAtributoSKU)
                                                {   
                                                    console.log(9889898989)
                                                    //AGREGAR O UPDATE A LA TABLA VALORES ATRIBUTOS
                                                    if(constAtributoSkuValores)
                                                    {
                                                        const bodyUpdate = {
                                                            "skuav_valor":  valorAtributoSKU.toString().toUpperCase(),   
                                                            "skuav_usu_usuario_modificador_id": 1,
                                                            updatedAt: Date()
                                                        }
                                                        await constAtributoSkuValores.update(bodyUpdate);
                                                    }
                                                    else
                                                    {
                                                        console.log(54545455)
                                                        const bodyCreate = {
                                                            "skuav_id_sku" : ProductoID,
                                                            "skuav_id_atributo_producto" :  ProductoAtributoID,
                                                            "skuav_valor":  valorAtributoSKU.toString().toUpperCase(),   
                                                            "skuav_cmm_estatus_id": statusControles.ATRIBUTO_SKU_VALOR.ACTIVO,
                                                            "skuav_usu_usuario_creador_id": 1
                                                        };
                                                        await models.AtributoSkuValores.create(bodyCreate);
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            //Fin cargar atributos d producto





                            //AGREGAR JSONS POR SKU
                                for (var i = 0; i < xlData.length; i++) 
                                {   
                                    const productoUpdate = await models.Producto.findOne({
                                        where: {
                                            prod_sku: xlData[i].SKU
                                        }
                                    });

                                    if(productoUpdate)
                                    {
                                        //Viñetas
                                            var arrayVinetas = [];

                                            if(xlData[i].Viñeta != null && xlData[i].Viñeta != '')
                                            {
                                                var agregar = {
                                                    Viñeta: xlData[i].Viñeta
                                                }

                                                arrayVinetas.push(agregar)
                                            }

                                            if(xlData[i].Viñeta_1 != null && xlData[i].Viñeta_1 != '')
                                            {
                                                var agregar = {
                                                    Viñeta_1: xlData[i].Viñeta_1
                                                }

                                                arrayVinetas.push(agregar)
                                            }

                                            if(xlData[i].Viñeta_2 != null && xlData[i].Viñeta_2 != '')
                                            {
                                                var agregar = {
                                                    Viñeta_2: xlData[i].Viñeta_2
                                                }

                                                arrayVinetas.push(agregar)
                                            }

                                            if(xlData[i].Viñeta_3 != null && xlData[i].Viñeta_3 != '')
                                            {
                                                var agregar = {
                                                    Viñeta_3: xlData[i].Viñeta_3
                                                }

                                                arrayVinetas.push(agregar)
                                            }

                                            if(xlData[i].Viñeta_4 != null && xlData[i].Viñeta_4 != '')
                                            {
                                                var agregar = {
                                                    Viñeta_4: xlData[i].Viñeta_4
                                                }

                                                arrayVinetas.push(agregar)
                                            }

                                            arrayVinetas = JSON.stringify(arrayVinetas);
                                        //Fin Viñetas



                                        //Caracteristicas Tecnicas
                                            var arrayCaracteristicasTecnicas = [];

                                            if(xlData[i].Nombre_de_Caracteristica_Tecnica_1 != null && xlData[i].Nombre_de_Caracteristica_Tecnica_1 != '' 
                                                && xlData[i].Valor_de_Caracteristica_Tecnica_1 != null && xlData[i].Valor_de_Caracteristica_Tecnica_1 != '')
                                            {

                                                var nombre1 = xlData[i].Nombre_de_Caracteristica_Tecnica_1
                                                var agregar = "{"+nombre1+": "+xlData[i].Valor_de_Caracteristica_Tecnica_1+"}"

                                                arrayCaracteristicasTecnicas.push(agregar)
                                            }

                                            if(xlData[i].Nombre_de_Caracteristica_Tecnica_2 != null && xlData[i].Nombre_de_Caracteristica_Tecnica_2 != '' 
                                                && xlData[i].Valor_de_Caracteristica_Tecnica_2 != null && xlData[i].Valor_de_Caracteristica_Tecnica_2 != '')
                                            {
                                                var nombre2 = xlData[i].Nombre_de_Caracteristica_Tecnica_2
                                                var agregar = "{"+nombre2+": "+xlData[i].Valor_de_Caracteristica_Tecnica_2+"}"

                                                arrayCaracteristicasTecnicas.push(agregar)
                                            }

                                            if(xlData[i].Nombre_de_Caracteristica_Tecnica_3 != null && xlData[i].Nombre_de_Caracteristica_Tecnica_3 != '' 
                                                && xlData[i].Valor_de_Caracteristica_Tecnica_3 != null && xlData[i].Valor_de_Caracteristica_Tecnica_3 != '')
                                            {
                                                var nombre3 = xlData[i].Nombre_de_Caracteristica_Tecnica_3
                                                var agregar = "{"+nombre3+": "+xlData[i].Valor_de_Caracteristica_Tecnica_3+"}"

                                                arrayCaracteristicasTecnicas.push(agregar)
                                            }

                                            if(xlData[i].Nombre_de_Caracteristica_Tecnica_4 != null && xlData[i].Nombre_de_Caracteristica_Tecnica_4 != '' 
                                                && xlData[i].Valor_de_Caracteristica_Tecnica_4 != null && xlData[i].Valor_de_Caracteristica_Tecnica_4 != '')
                                            {
                                                var nombre4 = xlData[i].Nombre_de_Caracteristica_Tecnica_4
                                                var agregar = "{"+nombre4+": "+xlData[i].Valor_de_Caracteristica_Tecnica_4+"}"

                                                arrayCaracteristicasTecnicas.push(agregar)
                                            }

                                            if(xlData[i].Nombre_de_Caracteristica_Tecnica_5 != null && xlData[i].Nombre_de_Caracteristica_Tecnica_5 != '' 
                                                && xlData[i].Valor_de_Caracteristica_Tecnica_5 != null && xlData[i].Valor_de_Caracteristica_Tecnica_5 != '')
                                            {
                                                var nombre5 = xlData[i].Nombre_de_Caracteristica_Tecnica_5
                                                var agregar = "{"+nombre5+": "+xlData[i].Valor_de_Caracteristica_Tecnica_5+"}"

                                                arrayCaracteristicasTecnicas.push(agregar)
                                            }

                                            if(xlData[i].Nombre_de_Caracteristica_Tecnica_6 != null && xlData[i].Nombre_de_Caracteristica_Tecnica_6 != '' 
                                                && xlData[i].Valor_de_Caracteristica_Tecnica_6 != null && xlData[i].Valor_de_Caracteristica_Tecnica_6 != '')
                                            {
                                                var nombre6 = xlData[i].Nombre_de_Caracteristica_Tecnica_6
                                                var agregar = "{"+nombre6+": "+xlData[i].Valor_de_Caracteristica_Tecnica_6+"}"

                                                arrayCaracteristicasTecnicas.push(agregar)
                                            }

                                            if(xlData[i].Nombre_de_Caracteristica_Tecnica_7 != null && xlData[i].Nombre_de_Caracteristica_Tecnica_7 != '' 
                                                && xlData[i].Valor_de_Caracteristica_Tecnica_7 != null && xlData[i].Valor_de_Caracteristica_Tecnica_7 != '')
                                            {
                                                var nombre7 = xlData[i].Nombre_de_Caracteristica_Tecnica_7
                                                var agregar = "{"+nombre7+": "+xlData[i].Valor_de_Caracteristica_Tecnica_7+"}"

                                                arrayCaracteristicasTecnicas.push(agregar)
                                            }

                                            arrayCaracteristicasTecnicas = JSON.stringify(arrayCaracteristicasTecnicas);
                                        //Fin Viñetas

                                        console.log(12365478)

                                        var descripcion = ""
                                        if(typeof xlData[i].Descripción !== 'undefined' && xlData[i].Descripción)
                                        { 
                                            // descripcion = xlData[i].Descripción.toUpperCase()
                                            descripcion = xlData[i].Descripción
                                        }
                                        
                                        var nombre_producto = ""
                                        if(typeof xlData[i].Título !== 'undefined' && xlData[i].Título)
                                        { 
                                            nombre_producto = xlData[i].Título.toUpperCase()
                                        }

                                        const bodyUpdate = {
                                            "prod_viñetas" : arrayVinetas, 
                                            "prod_descripcion": descripcion,
                                            "prod_nombre": nombre_producto,
                                            "prod_caracteristicas_tecnicas": arrayCaracteristicasTecnicas
                                        };
                                        await productoUpdate.update(bodyUpdate);

                                    }
                                }
                            //Fin agregar campos desde excel a producto
                        }



                        if(((archivos.length - 1) == indexArchivo) && ((req.files.length -1) == indexUpload)){
                            res.status(200).send({
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
    fileExcelCargaMasivaUpload: async (req, res, next)=>{
        try{
            await fs.readdir(DIREXCEL, async function(err, archivos){
                if(err){
                    onerror(err);
                    return;
                }
                archivos.forEach(async function(archivo, indexArchivo){
                    req.files.forEach(async function(archivoUpload, indexUpload){
                        if(archivo == archivoUpload.filename){

                            //Setear back url para las apis
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


                            //Cargar Atributos de producto
                                var workbook = XLSX.readFile(DIREXCEL+"/"+archivo);
                                var sheet_name_list = workbook.SheetNames;
             
                                var numPlantillaViñetas = 0;


                                for (var i = 0; i < sheet_name_list.length; i++) 
                                {
                                    if(sheet_name_list[i] == "Carga_Masiva")
                                    {
                                        numPlantillaViñetas = i
                                        break
                                    }
                                }

                                var xlData = XLSX.utils.sheet_to_json(workbook.Sheets[sheet_name_list[numPlantillaViñetas]]);


                                var existeCarrito = false
                                var carrito_id = 0
                                var sn_socio_id = req.body.cdc_sn_socio_de_negocio_id

                                const constCarrito_de_comprasExiste = await models.CarritoDeCompra.findOne({
                                    where: {
                                        cdc_sn_socio_de_negocio_id: sn_socio_id
                                    }
                                });

                                if(constCarrito_de_comprasExiste)
                                {
                                    existeCarrito = true
                                    carrito_id = constCarrito_de_comprasExiste.cdc_carrito_de_compra_id
                                }




                                //AGREGAR JSONS POR SKU
                                for (var i = 0; i < xlData.length; i++) 
                                {   
                                    const constProducto = await models.Producto.findOne({
                                        where: {
                                            prod_nombre_extranjero: xlData[i].SKU
                                        }
                                    });

                                    if(constProducto)
                                    {
                                        //Si el carrito existe se agregara
                                        if(existeCarrito == true)
                                        {
                                            console.log("CARRITO EXISTE")


                                            const constProductoCarritoDeCompra = await models.ProductoCarritoDeCompra.findOne({
                                                where: {
                                                    pcdc_prod_producto_id: constProducto.prod_producto_id,
                                                    pcdc_carrito_de_compra_id: carrito_id
                                                }
                                            });

                                            if(constProductoCarritoDeCompra)
                                            {
                                                const bodyUpdate = {
                                                    "pcdc_producto_cantidad": constProductoCarritoDeCompra.pcdc_producto_cantidad + xlData[i].CANTIDAD,
                                                    updatedAt: Date()
                                                }
                                                
                                                await constProductoCarritoDeCompra.update(bodyUpdate);
                                            }
                                            else
                                            {



                                                const options = {
                                                    method: 'POST',
                                                    url: BackUrl + '/api/carrito_de_compras/add_product',
                                                    headers: {
                                                        'Content-Type': 'application/json'
                                                    },
                                                    body: {
                                                        pcdc_carrito_de_compra_id: carrito_id,
                                                        pcdc_prod_producto_id: constProducto.prod_producto_id,
                                                        pcdc_producto_cantidad: xlData[i].CANTIDAD
                                                    },
                                                    json: true
                                                };

                                                var result = await request(options, function (error, response) 
                                                {
                                                });
                                            }


                                            

                                        }
                                        //Si no existe se creara
                                        else
                                        {
                                            existeCarrito = true;
                                            const options = {
                                                method: 'POST',
                                                url: BackUrl + '/api/carrito_de_compras/create',
                                                headers: {
                                                    'Content-Type': 'application/json'
                                                },
                                                body: {
                                                    cdc_sn_socio_de_negocio_id: sn_socio_id,
                                                    pcdc_prod_producto_id: constProducto.prod_producto_id,
                                                    pcdc_producto_cantidad: xlData[i].CANTIDAD
                                                },
                                                json: true
                                            };

                                            var result = await request(options, function (error, response) 
                                            {
                                            });


                                            //Este codigo se repite pero es para que a partir del socio de negocio tome el nuevo carrito id
                                            const constCarrito_de_comprasExiste2 = await models.CarritoDeCompra.findOne({
                                                where: {
                                                    cdc_sn_socio_de_negocio_id: sn_socio_id
                                                }
                                            });

                                            if(constCarrito_de_comprasExiste2)
                                            {
                                                existeCarrito = true
                                                carrito_id = constCarrito_de_comprasExiste2.cdc_carrito_de_compra_id
                                            }

                                        }
                                        
                                    }


                                }
                            //Fin cargar atributos d producto

                        }
                        if(((archivos.length - 1) == indexArchivo) && ((req.files.length -1) == indexUpload)){
                            res.status(200).send({
                                message: 'Documento cargado correctamente'
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






    QuickShopExcelUpload: async (req, res, next)=>{
        try{
            var cantidadAgregados = 0
            var cantidadNoAgregados = 0

            var agregadosJson = []
            var NoagregadosJson = []
            await fs.readdir(DIREXCEL, async function(err, archivos){
                if(err){
                    onerror(err);
                    return;
                }
                archivos.forEach(async function(archivo, indexArchivo){
                    req.files.forEach(async function(archivoUpload, indexUpload){
                        if(archivo == archivoUpload.filename){



                            //Cargar Atributos de producto
                                var workbook = XLSX.readFile(DIREXCEL+"/"+archivo);
                                var sheet_name_list = workbook.SheetNames;
             
                                var numPlantillaViñetas = 0;

                                for (var i = 0; i < sheet_name_list.length; i++) 
                                {
                                    if(sheet_name_list[i] == "quick_shop")
                                    {
                                        numPlantillaViñetas = i
                                        break
                                    }
                                }

                                var xlData = XLSX.utils.sheet_to_json(workbook.Sheets[sheet_name_list[numPlantillaViñetas]]);

                                var carrito_id
                                var sn_socio_id = req.body.cdc_sn_socio_de_negocio_id


                                const constCarritoDeCompra = await models.CarritoDeCompra.findOne({
                                    where: {
                                        cdc_sn_socio_de_negocio_id: sn_socio_id
                                    }
                                });

                                if(constCarritoDeCompra)
                                {
                                    carrito_id = constCarritoDeCompra.cdc_carrito_de_compra_id
                                }

                                //AGREGAR JSONS POR SKU
                                for (var i = 0; i < xlData.length; i++) 
                                {   
                                    //Validar producto que exista y es comprable
                                    const constProducto = await models.Producto.findOne({
                                        where: {
                                            prod_nombre_extranjero: xlData[i].codigo_nombre_foraneo,
                                            prod_prod_producto_padre_sku: { [Op.ne] : null },
                                            prod_precio: { [Op.ne] : 0 },
                                            prod_peso: { [Op.ne] : 0 },
                                            prod_volumen: { [Op.ne] : 0 },
                                            prod_mostrar_en_tienda: true,
                                            prod_cmm_estatus_id: statusControllers.ESTATUS_PRODUCTO.ACTIVO
                                        }
                                    });

                                    if(constProducto)
                                    {
                                        //Validar que la categoria donde se encuentre este activa
                                        const constCategoria = await models.Categoria.findOne({
                                            where: {
                                                cat_categoria_id: constProducto.prod_codigo_grupo,
                                                cat_cmm_estatus_id: statusControllers.ESTATUS_CATEGORIA.ACTIVO
                                            }
                                        });

                                        //Significa que existe y esta activo
                                        if(constCategoria)
                                        {

                                            const constProductoCarritoDeCompra = await models.ProductoCarritoDeCompra.findOne(
                                            {
                                                where: {
                                                    pcdc_carrito_de_compra_id: carrito_id,
                                                    pcdc_prod_producto_id: constProducto.prod_producto_id
                                                },
                                                attributes: {
                                                    exclude: ['createdAt','updatedAt','pcdc_lista_precio','pcdc_precio','pcdc_prod_producto_id_regalo','pcdc_cantidad_producto_regalo',
                                                    'pcdc_descuento_promocion', 'pcdc_prod_producto_id_promocion', 'pcdc_cantidad_producto_promocion', 'pcdc_cupon_aplicado',
                                                    'pcdc_mejor_descuento', 'pcdc_almacen_surtido', 'pcdc_no_disponible_para_compra', 'pcdc_back_order', 'pcdc_validado']
                                                }
                                            });





                                            //Si el row del carrito existe lo actualizara
                                            if(constProductoCarritoDeCompra)
                                            {
                                                var newCantidad = xlData[i].cantidad + constProductoCarritoDeCompra.pcdc_producto_cantidad
                                                var agregadoBool = true

                                                //Si tiene Stock completo o tiene back order no hara nada
                                                if(constProducto.prod_total_stock > newCantidad || constProducto.prod_dias_resurtimiento > 0)
                                                {

                                                }
                                                //Significa que tiene backorder y todo bien
                                                else if (constProducto.prod_dias_resurtimiento > 0)
                                                {

                                                }
                                                //significa que tiene una X cantidad de stock pero no completo y no tiene resurtimiento
                                                else if(constProducto.prod_total_stock > 0 && constProducto.prod_dias_resurtimiento == 0)
                                                {
                                                    newCantidad = constProducto.prod_total_stock
                                                }
                                                //Singifica que no tiene stock y no tiene backorder
                                                else if(constProducto.prod_total_stock == 0 && constProducto.prod_dias_resurtimiento == 0)
                                                {
                                                    agregadoBool = false
                                                }


                                                if(agregadoBool == true)
                                                {
                                                    //Actualizar la cantidad porque el ID del producto ya existe para ese carrito
                                                    await constProductoCarritoDeCompra.update({
                                                        pcdc_producto_cantidad: newCantidad,
                                                        updatedAt: Date()
                                                    });

                                                    cantidadAgregados++
                                                    agregadosJson.push(xlData[i].codigo_nombre_foraneo)

                                                }
                                                else
                                                {
                                                    cantidadNoAgregados++
                                                    var bodyTemp = {
                                                        "SKU": xlData[i].codigo_nombre_foraneo,
                                                        "Motivo": "Inventario no disponible"
                                                    }
                                                    NoagregadosJson.push(bodyTemp)

                                                }



                                            }
                                            //Si no existe lo creara el row de productos carrito
                                            else
                                            {
                                                var newCantidad = xlData[i].cantidad
                                                var agregadoBool = true

                                                //Si tiene Stock completo o tiene back order no hara nada
                                                if(constProducto.prod_total_stock > newCantidad || constProducto.prod_dias_resurtimiento > 0)
                                                {

                                                }
                                                //Significa que tiene backorder y todo bien
                                                else if (constProducto.prod_dias_resurtimiento > 0)
                                                {

                                                }
                                                //significa que tiene una X cantidad de stock pero no completo y no tiene resurtimiento
                                                else if(constProducto.prod_total_stock > 0 && constProducto.prod_dias_resurtimiento == 0)
                                                {
                                                    newCantidad = constProducto.prod_total_stock
                                                }
                                                //Singifica que no tiene stock y no tiene backorder
                                                else if(constProducto.prod_total_stock == 0 && constProducto.prod_dias_resurtimiento == 0)
                                                {
                                                    agregadoBool = false
                                                }


                                                if(agregadoBool == true)
                                                {
                                                    //JSON para agregar un producto al carrito
                                                    const bodyCreate = {
                                                        "pcdc_carrito_de_compra_id": carrito_id,
                                                        "pcdc_prod_producto_id": constProducto.prod_producto_id,
                                                        "pcdc_producto_cantidad": newCantidad
                                                    };
                                                    
                                                    //Const que genera el id del sn
                                                    const exito = await models.ProductoCarritoDeCompra.create(bodyCreate)

                                                    cantidadAgregados++
                                                    agregadosJson.push(xlData[i].codigo_nombre_foraneo)

                                                }
                                                else
                                                {

                                                    cantidadNoAgregados++
                                                    var bodyTemp = {
                                                        "SKU": xlData[i].codigo_nombre_foraneo,
                                                        "Motivo": "Inventario no disponible"
                                                    }
                                                    NoagregadosJson.push(bodyTemp)
                                                }
                                            }
                                        }
                                        else
                                        {
                                            cantidadNoAgregados++
                                            var bodyTemp = {
                                                "SKU": xlData[i].codigo_nombre_foraneo,
                                                "Motivo": "Categoria no activa"
                                            }
                                            NoagregadosJson.push(bodyTemp)
                                        }
                                    }
                                    else
                                    {
                                        cantidadNoAgregados++

                                        var bodyTemp = {
                                            "SKU": xlData[i].codigo_nombre_foraneo,
                                            "Motivo": "Producto no encontrado"
                                        }

                                        NoagregadosJson.push(bodyTemp)
                                    }
                                }
                            //Fin cargar atributos d producto
                        }
                        if(((archivos.length - 1) == indexArchivo) && ((req.files.length -1) == indexUpload)){
                            res.status(200).send({
                                message: 'Documento cargado correctamente',
                                cantidadAgregados,
                                agregadosJson,
                                cantidadNoAgregados,
                                NoagregadosJson
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
            console.log(e)
            res.status(500).send({
                message: 'Error al cargar el archivo, no se a podeido procesar de manera adecuada',
                e
            });
            next(e);
        }
    },




    CategoryChangeExcelUpload: async (req, res, next)=>{
        try{
            var cantidadAgregados = 0
            var cantidadNoAgregados = 0

            var agregadosJson = []
            var NoagregadosJson = []


            await fs.readdir(DIREXCEL, async function(err, archivos)
            {
                if(err)
                {
                    onerror(err);
                    return;
                }
                archivos.forEach(async function(archivo, indexArchivo)
                {
                    req.files.forEach(async function(archivoUpload, indexUpload)
                    {
                        if(archivo == archivoUpload.filename)
                        {
                            //Cargar Atributos de producto
                            var workbook = XLSX.readFile(DIREXCEL+"/"+archivo);
                            var sheet_name_list = workbook.SheetNames;
         
                            var numPlantillaViñetas = 0;

                            for (var i = 0; i < sheet_name_list.length; i++) 
                            {
                                if(sheet_name_list[i] == "categorias")
                                {
                                    numPlantillaViñetas = i
                                    break
                                }
                            }

                            var xlData = XLSX.utils.sheet_to_json(workbook.Sheets[sheet_name_list[numPlantillaViñetas]]);

                            //AGREGAR JSONS POR SKU
                            for (var i = 0; i < xlData.length; i++) 
                            {   
                                console.log(xlData[i].categoria_id)
                                const productoUpdate = await models.Producto.findOne(
                                {
                                    where: 
                                    {
                                        prod_sku: xlData[i].prod_sku_padre,
                                        prod_prod_producto_padre_sku: null
                                    }
                                });

                                if(productoUpdate)
                                {
                                    agregadosJson.push(xlData[i].prod_sku_padre)
                                    cantidadAgregados++


                                    var actualizarCategoriasHijos = false
                                    if(productoUpdate.prod_cat_categoria_id != xlData[i].categoria_id)
                                    {
                                        console.log("entro al update categorias")
                                        actualizarCategoriasHijos = true
                                    }

                                    await productoUpdate.update(
                                    {
                                        prod_cat_categoria_id: !!xlData[i].categoria_id ? xlData[i].categoria_id : productoUpdate.dataValues.prod_cat_categoria_id,
                                        updatedAt: Date(),
                                    });

                                    //Actualizara las categorias de los hijos en caso de que la categoria sea diferente a la actual
                                    if(actualizarCategoriasHijos == true)
                                    {
                                        // Buscar todos los hijos para cambiar el codigo_grupo de la tabla productos
                                        const constProductosHijo = await models.Producto.findAll(
                                        {
                                            where: {
                                                prod_prod_producto_padre_sku: productoUpdate.prod_sku
                                            },
                                            attributes: {exclude: ['createdAt', 'updatedAt']}   
                                        });


                                        //Recorrer hijos
                                        for (var j = 0; j < constProductosHijo.length; j++) 
                                        {
                                            console.log(constProductosHijo[j].dataValues)

                                            console.log("3490283092")
                                            // Buscar todos los hijos para cambiar el codigo_grupo de la tabla productos
                                            const constProductoHijoActualizar = await models.Producto.findOne(
                                            {
                                                where: {
                                                    prod_producto_id: constProductosHijo[j].dataValues.prod_producto_id
                                                },
                                                attributes: {exclude: ['createdAt', 'updatedAt']}   
                                            });

                                            if(constProductoHijoActualizar)
                                            {
                                                await constProductoHijoActualizar.update(
                                                {
                                                    prod_codigo_grupo : xlData[i].categoria_id
                                                })
                                            }
                                        }
                                    }
                                }
                                else
                                {
                                    NoagregadosJson.push(xlData[i].prod_sku_padre)
                                    cantidadNoAgregados++
                                }
                            }
                        }
                        if(((archivos.length - 1) == indexArchivo) && ((req.files.length -1) == indexUpload))
                        {
                            res.status(200).send({
                                message: 'Documento cargado correctamente',
                                cantidadAgregados,
                                agregadosJson,
                                cantidadNoAgregados,
                                NoagregadosJson
                            });

                            await fsPromises.unlink(DIREXCEL + "/" + archivo, err =>
                            {
                                if(err)
                                {
                                    console.log("no jalo fsPromises.unlink")
                                    return "error";
                                }
                            });
                        }
                    });
                });
            });
        }catch(e){
            console.log(e)
            res.status(500).send({
                message: 'Error al cargar el archivo, no se a podeido procesar de manera adecuada',
                e
            });
            next(e);
        }
    },











    uploadZipFileV2: async function(req, res, next) {
        try{

            var carpetasNameJson = []

            //Leemos el directorio compres y extraemos las imagenes en la carpeta temporal
            await fs.readdir(DIRAR, async function(err, archivos)
            {
                if(err)
                {
                    console.log("error del readdir?")
                    console.log(err)
                    
                    return;
                }

                //Sino existe la carpeta temp, la cramos
                if(await !fs.existsSync(DIRAR + 'temp')){
                    await fs.promises.mkdir(DIRAR + 'temp', 
                    { 
                        recursive: true 
                    });
                }

                //eliminar la carpeta temp del array de archivos (v2)
                for(var q = 0; q < archivos.length; q++)
                {
                    if(archivos[q] == "temp")
                    {
                        archivos.splice([q])
                    }
                }


                //Recorrer todos los archivos y obtener todos los nombres de carpeta v2
                if(await fs.existsSync(DIRAR + 'temp'))
                {
                    // console.log("entro al if : " + DIRAR + 'temp')
                    // console.log(archivos.length)

                    for(var i = 0; i < archivos.length; i++)
                    {
                        console.log(archivos[i])


                        //archivo == archivos[i]

                        //carga el archivo en una variable Nombre
                        const zip = new AdmZip(DIRAR + archivos[i]);

                        //descomprime todos los archivos en la carpeta temporal
                        zip.extractAllTo(DIRAR + 'temp');


                        //obtiene la informacion de los archivos del zip
                        const zipEntries = zip.getEntries(); // an array of ZipEntry records

                        //Recorrer cada archivo para obtener el nombre de la carpeta que luego sera eliminada
                        for(var j = 0; j < zipEntries.length; j++)
                        {
                            const nombreCarpeta = zipEntries[j].entryName.split('_')[0];

                            var temporal = carpetasNameJson.indexOf(nombreCarpeta)

                            if(carpetasNameJson.indexOf(nombreCarpeta) >= 0)
                            {}
                            else
                            {
                                carpetasNameJson.push(nombreCarpeta)
                            }
                        }
                    }
                }





















                //Eliminar los archivos de las carpetas obtenidas
                for(var u = 0; u < carpetasNameJson.length; u++)
                {
                    if(fs.existsSync(DIR + carpetasNameJson[u]))
                    {
                        //Variable donde dejara los archivos por carpeta
                        var existenArchivos = await fs.readdirSync(DIR + carpetasNameJson[u], async function(err, archivosDelete) 
                        {
                        });

                        var boolEliminarBDInfo = true

                        //Eliminar archivos 1x1
                        for(var p = 0; p < existenArchivos.length; p++)
                        {
                            var resultadoEliminacion = await fs.unlinkSync(DIR + carpetasNameJson[u] + '/' + existenArchivos[p], async function(err, result)
                            {
                                if(err)
                                {
                                    boolEliminarBDInfo = false
                                    console.log('ERROR AL ELIMINAR', err);
                                    return;
                                }
                            })
                        }

                        //Eliminar informacion de la BD si borro con exito todos los archivos por carpeta
                        if(boolEliminarBDInfo == true)
                        {
                            const producto = await models.Producto.findOne({
                                where: {
                                    prod_sku: carpetasNameJson[u]
                                }
                            });

                            console.log(producto.dataValues.prod_producto_id, '<---- este es el id de producto');

                            await models.ImagenProducto.destroy({
                                where: {
                                    imgprod_prod_producto_id: producto.dataValues.prod_producto_id
                                }
                            });

                            console.log('File delete');
                        }
                    }
                }  



                //Despues de todo se elimina el archivo subido (zip)
                for(var f = 0; f < archivos.length; f++)
                {
                    await fs.unlink(DIRAR + archivos[f], err =>
                    {
                        if(err)
                        {
                            return;
                        }
                    });
                }


                










                //Obtener todos los archivos de la carpeta temporal para moverlos y crear sus objetos
                var archivosTemporales = await fs.readdirSync(DIRAR + 'temp', async function(err, archivos)
                {
                    if(err)
                    {
                        return;
                    }
                })

                console.log("archivosTemporales.length: "+archivosTemporales.length)
                console.log(archivosTemporales)





                //Una vez obtenidos procesar cada archivo (mover a la carpeta img)
                for(var g = 0; g < archivosTemporales.length; g++)
                {
                    //Nombre de carpeta que se va ha crear para el producto
                    const tempName = archivosTemporales[g].split('_')[0];
                    console.log('TEMPNAME', tempName);

                    //Sino existe la carpeta con ese SKU, la creamos....
                    if(!fs.existsSync(DIR + tempName))
                    {
                        console.log("CREADA CARPETA:" + tempName)
                        await fs.promises.mkdir(DIR + tempName, {
                            recursive: true 
                        });
                    }

                    // var boolMovidoExito = true

                    //Movemos los archivos de la carpeta temporal a su respectiva carpeta
                    await fs.rename(DIRAR + 'temp/' + archivosTemporales[g], DIR + tempName + '/' + archivosTemporales[g], function(err, result)
                    {
                        if(err)
                        {
                            console.log(err);
                            return false;
                        }
                    });

                }














                console.log("llego al meter a la BD")
                //Mandar a la BD los archivos
                for(var c = 0; c < carpetasNameJson.length; c++)
                {
                    console.log(carpetasNameJson[c])
                    //Variable donde dejara los archivos por carpeta de los archivos ya movidos
                    var existenArchivos = await fs.readdirSync(DIR + carpetasNameJson[c], async function(err, archivosDelete) 
                    {
                    });


                    if(existenArchivos.length > 0)
                    {
                        const constProducto = await models.Producto.findOne(
                        {
                            where: {
                                prod_sku: carpetasNameJson[c]
                            }
                        });

                        if(constProducto)
                        {

                            //Insertara cada archivo
                            for(var v = 0; v < existenArchivos.length; v++)
                            {
                                console.log("intentara insertar:" + existenArchivos[v])

                                await models.ImagenProducto.create(
                                {
                                    imgprod_prod_producto_id: constProducto.prod_producto_id,
                                    imgprod_nombre_archivo: existenArchivos[v],
                                    imgprod_ruta_archivo: DIR + carpetasNameJson[c] + '/' + existenArchivos[v],
                                    imgprod_usu_usuario_creador_id: req.body.imgprod_usu_usuario_creador_id
                                });

                            }
                        }
                        else
                        {

                            console.log("producto no encontrad")
                        }
                    }
                }

            });
                
               
            res.status(200).send(
            {
                message: 'Carga exitosa'
            })
        }
        catch(e)
        {
            console.log(e)
            res.status(500).send({
                message: 'Error al cargar archivos',
                e
            });
            next(e);
        }
    },



































    //Obtiene carrito y Lo genera si el Socio de negocio no tiene uno asignado
    uploadZipDataSheet: async(req, res, next) =>{
        try{
            //Creara la carpeta principal de los archivos
            var crearCarpeta = await fileUploadUtil.crearCarpetaCompressYTemporal();
            // console.log(crearCarpeta)


            //Cargara los archivos de la carpeta compress para luego saber que hacer con ellos
            var archivos = await fileUploadUtil.cargarCarpetaCompress();
            console.log(archivos);



            //obtener nombre de carpetas que se borraran y actualizara json // tambien descomprime el archivo zip ya que esta en ese proceso (cosa de mario?)
            var carpetasNameJson = await fileUploadUtil.obtenerTodasLasCarpetasDePDF(archivos, DIRPDF);

            //borrar archivos de carpetas actuales
            var articulosNoEncontradosCount = await fileUploadUtil.borrarInformacionYArchivosActuales(carpetasNameJson, DIRPDF);


            //borrar archivos de carpetas actuales
            var resultborrarArchivoZIP = await fileUploadUtil.borrarArchivoZIP(archivos);


            //borrar archivos de carpetas actuales
            var resultmoverArchivosAPDF = await fileUploadUtil.moverArchivosAPDF(archivos, DIRPDF);

            //borrar archivos de carpetas actuales
            var resultcargarBDImagenesProductosG = await fileUploadUtil.cargarBDImagenesProductos(carpetasNameJson, req.body.pdfprod_usu_usuario_creador_id, DIRPDF);

            res.status(200).send({
                message: 'Cargado con exito',
            })
        }
        catch(e)
        {
            res.status(500).send({
                message: 'Error al cargar imagenes',
                e
            });
            next(e);
        }
    },
    //Obtiene carrito y Lo genera si el Socio de negocio no tiene uno asignado
    uploadZipFileV3: async(req, res, next) =>{
        try{

            //Creara la carpeta principal de los archivos
            var crearCarpeta = await fileUploadUtil.crearCarpetaCompressYTemporal();
            console.log(crearCarpeta)


            //Cargara los archivos de la carpeta compress para luego saber que hacer con ellos
            var archivos = await fileUploadUtil.cargarCarpetaCompress();




            //obtener nombre de carpetas que se borraran y actualizara json // tambien descomprime el archivo zip ya que esta en ese proceso (cosa de mario?)
            var carpetasNameJson = await fileUploadUtil.obtenerTodasLasCarpetasDeIMG(archivos, DIR);


            //borrar archivos de carpetas actuales
            var articulosNoEncontradosCount = await fileUploadUtil.borrarInformacionYArchivosActuales(carpetasNameJson, DIR);


            //borrar archivos de carpetas actuales
            var resultborrarArchivoZIP = await fileUploadUtil.borrarArchivoZIP(archivos);


            //borrar archivos de carpetas actuales
            var resultmoverArchivosAIMG = await fileUploadUtil.moverArchivosAIMG(archivos, DIR);


            //borrar archivos de carpetas actuales
            var resultcargarBDImagenesProductosG = await fileUploadUtil.cargarBDImagenesProductos(carpetasNameJson, req.body.imgprod_usu_usuario_creador_id, DIR);


            //Retornara el id del nuevo carrito
            res.status(200).send({
                message: 'Cargado con exito',
                totalArticulosEncontrados: carpetasNameJson.length,
                ArticulosNoExistentesEnBD: articulosNoEncontradosCount,
            })
        }
        catch(e)
        {
            res.status(500).send({
                message: 'Error al cargar imagenes',
                e
            });
            next(e);
        }
    },
}

