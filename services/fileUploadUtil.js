import models from '../models';
import { Sequelize } from 'sequelize';
const sequelize = new Sequelize(process.env.POSTGRESQL);
const { Op } = require("sequelize");



import AdmZip from 'adm-zip';
import fs from 'fs';
const fsPromises = fs.promises;

import path from 'path';
// const DIR = './public/img/';
const DIRAR = './public/compressed/';
// const DIRPDF = './public/pdf/';
const PRIVATE_SOLICITUD = './private/compressed';
const DIREXCEL = './public/excel/temp';




module.exports = {
    crearCarpetaCompressYTemporal: async function () {
        try{
            //Sino existe la carpeta temp, la cramos
            if(await !fs.existsSync(DIRAR + 'temp')){
                await fs.promises.mkdir(DIRAR + 'temp', 
                { 
                    recursive: true 
                });
            }


            return "creado con exito"
        }
        catch(e){
            console.log(e)
            return "error"
        }
    },
    cargarCarpetaCompress: async function () {
        try{
            //Leemos el directorio compres y extraemos las imagenes en la carpeta temporal
            var archivos = await fsPromises.readdir(DIRAR)
            {
            }

            //eliminar la carpeta temp del array de archivos (v2)
            for(var q = 0; q < archivos.length; q++)
            {
                if(archivos[q] == "temp")
                {
                    archivos.splice([q])
                }
            }
            return archivos
        }
        catch(e){
            console.log(e)
            return "error"
        }
    },
    obtenerTodasLasCarpetasDeIMG: async function (archivos) {
        try{
            //Recorrer todos los archivos y obtener todos los nombres de carpeta v2
            var carpetasNameJson = []

            if(await fs.existsSync(DIRAR + 'temp'))
            {
                console.log("entro al if : " + DIRAR + 'temp')
                console.log(archivos.length)

                for(var i = 0; i < archivos.length; i++)
                {
                    console.log(archivos[i])

                    //carga el archivo en una variable Nombre
                    const zip = new AdmZip(DIRAR + archivos[i]);

                    //descomprime todos los archivos en la carpeta temporal
                    zip.extractAllTo(DIRAR + 'temp');

                    //obtiene la informacion de los archivos del zip
                    const zipEntries = zip.getEntries(); // an array of ZipEntry records

                    //Recorrer cada archivo para obtener el nombre de la carpeta que luego sera eliminada
                    for(var j = 0; j < zipEntries.length; j++)
                    {
                        let nombreCarpeta = zipEntries[j].entryName.split('_')[0];
                        if (nombreCarpeta[0] === "/") {
                            nombreCarpeta = nombreCarpeta.split('/')[1];
                        }

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

            return carpetasNameJson
        }
        catch(e){
            console.log(e)
            return "error al obtener todas las carpetas"
        }
    },
    obtenerTodasLasCarpetasDePDF: async function (archivos) {
        try{
            //Recorrer todos los archivos y obtener todos los nombres de carpeta v2
            var carpetasNameJson = []

            if(await fs.existsSync(DIRAR + 'temp'))
            {
                console.log("entro al if : " + DIRAR + 'temp')
                console.log(archivos.length)

                for(var i = 0; i < archivos.length; i++)
                {
                    console.log(archivos[i])

                    //carga el archivo en una variable Nombre
                    const zip = new AdmZip(DIRAR + archivos[i]);

                    //descomprime todos los archivos en la carpeta temporal
                    zip.extractAllTo(DIRAR + 'temp');

                    //obtiene la informacion de los archivos del zip
                    const zipEntries = zip.getEntries(); // an array of ZipEntry records

                    //Recorrer cada archivo para obtener el nombre de la carpeta que luego sera eliminada
                    for(var j = 0; j < zipEntries.length; j++)
                    {
                        const fileSplit = zipEntries[j].entryName.split('_');
                        let nombreCarpeta = "";
                        if(fileSplit.length === 1) {
                            nombreCarpeta = fileSplit[0].split('.')[0];
                        } 
                        else {
                            nombreCarpeta = fileSplit[0];
                        }
                        // const nombreCarpeta = zipEntries[j].entryName.split('_')[0];

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

            return carpetasNameJson
        }
        catch(e){
            console.log(e)
            return "error al obtener todas las carpetas"
        }
    },
    borrarInformacionYArchivosActuales: async function (carpetasNameJson, DIR) {
        try{
            console.log("entro al borrar")
            var articulosNoEncontradosCount = 0

            //Eliminar los archivos de las carpetas obtenidas
            for(var u = 0; u < carpetasNameJson.length; u++)
            {
                console.log("entro al for")
                console.log(carpetasNameJson.length)

                if(fs.existsSync(DIR + carpetasNameJson[u]))
                {
                    console.log("entro al existsync")

                    var existenArchivos = await fsPromises.readdir(DIR + carpetasNameJson[u])
                    {
                    }

                    console.log(existenArchivos)
                    // var boolEliminarBDInfo = true

                    //Eliminar archivos 1x1
                    for(var p = 0; p < existenArchivos.length; p++)
                    {
                        var resultadoEliminacion = await fsPromises.unlink(DIR + carpetasNameJson[u] + '/' + existenArchivos[p])
                        {

                        }
                        console.log("borrado: "+DIR + carpetasNameJson[u] + '/' + existenArchivos[p])
                    }

                    //Eliminar informacion de la BD si borro con exito todos los archivos por carpeta
                    const producto = await models.Producto.findOne({
                        where: {
                            prod_sku: carpetasNameJson[u]
                        }
                    });

                    if(producto)
                    {
                        console.log(producto.dataValues.prod_producto_id, '<---- este es el id de producto');

                        await models.ImagenProducto.destroy({
                            where: {
                                imgprod_prod_producto_id: producto.dataValues.prod_producto_id
                            }
                        });
                    }
                    else
                    {
                        articulosNoEncontradosCount = articulosNoEncontradosCount+1
                        console.log("producto no encontrado")
                    }
                    
                }
            }  
            return articulosNoEncontradosCount
        }
        catch(e){
            console.log(e)
            return "error al borrar informacion actual"
        }
    },
    borrarArchivoZIP: async function (archivos) {
        try{
            console.log("netro al borrar zip")
            //Despues de todo se elimina el archivo subido (zip)
            for(var f = 0; f < archivos.length; f++)
            {   
                console.log("Archivos:" +   archivos[f] )
                await fsPromises.unlink(DIRAR + archivos[f], err =>
                {
                    if(err)
                    {
                        return "error";
                    }
                });
            }

            return true
        }
        catch(e){
            console.log(e)
            return "error al borrar zip"
        }
    },
    moverArchivosAIMG: async function (archivos, DIR) {
        try{
            //Obtener todos los archivos de la carpeta temporal para moverlos y crear sus objetos
            var archivosTemporales = await fsPromises.readdir(DIRAR + 'temp')
            {
            }

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

                console.log("Moviendo: " + DIRAR + 'temp/' + archivosTemporales[g])
                //Movemos los archivos de la carpeta temporal a su respectiva carpeta
                var resultkk = await fsPromises.rename(DIRAR + 'temp/' + archivosTemporales[g], DIR + tempName + '/' + archivosTemporales[g])
                {
                };

                console.log("termino de mover")

            }
            return true
        }
        catch(e){
            console.log(e)
            return "error al borrar zip"
        }
    },
    moverArchivosAPDF: async function (archivos, DIR) {
        try{
            //Obtener todos los archivos de la carpeta temporal para moverlos y crear sus objetos
            var archivosTemporales = await fsPromises.readdir(DIRAR + 'temp')
            {
            }

            console.log("archivosTemporales.length: "+archivosTemporales.length)
            console.log(archivosTemporales)


            //Una vez obtenidos procesar cada archivo (mover a la carpeta img)
            for(var g = 0; g < archivosTemporales.length; g++)
            {
                //Nombre de carpeta que se va ha crear para el producto
                const fileSplit = archivosTemporales[g].split('_');
                let tempName = "";
                if ( fileSplit.length === 1 ) {
                    tempName = fileSplit[0].split('.')[0];
                }
                else {
                    tempName = fileSplit[0];
                }
                // const tempName = archivosTemporales[g].split('_')[0];
                console.log('TEMPNAME', tempName);

                //Sino existe la carpeta con ese SKU, la creamos....
                if(!fs.existsSync(DIR + tempName))
                {
                    console.log("CREADA CARPETA:" + tempName)
                    await fs.promises.mkdir(DIR + tempName, {
                        recursive: true 
                    });
                }

                console.log("Moviendo: " + DIRAR + 'temp/' + archivosTemporales[g])
                //Movemos los archivos de la carpeta temporal a su respectiva carpeta
                var resultkk = await fsPromises.rename(DIRAR + 'temp/' + archivosTemporales[g], DIR + tempName + '/' + archivosTemporales[g])
                {
                };

                console.log("termino de mover")

            }
            return true
        }
        catch(e){
            console.log(e)
            return "error al borrar zip"
        }
    },
    cargarBDImagenesProductos: async function (carpetasNameJson, prod_usu_usuario_creador_id, DIR) {
        try{
            // //Obtener todos los archivos de la carpeta temporal para moverlos y crear sus objetos
            // var archivosTemporales = await fsPromises.readdir(DIRAR + 'temp')
            // {
            // }

            // console.log("archivosTemporales.length: "+archivosTemporales.length)
            // console.log(archivosTemporales)











            console.log("llego al meter a la BD")
                //Mandar a la BD los archivos
                for(var c = 0; c < carpetasNameJson.length; c++)
                {
                    console.log(carpetasNameJson[c])
                    //Variable donde dejara los archivos por carpeta de los archivos ya movidos
                    var existenArchivos = await fsPromises.readdir(DIR + carpetasNameJson[c])
                    {
                    };

                    console.log("archivos que existen en carpeta: " + DIR + carpetasNameJson[c])
                    console.log(existenArchivos)


                    if(existenArchivos.length > 0)
                    {
                        const constProducto = await models.Producto.findOne(
                        {
                            where: {
                                prod_sku: carpetasNameJson[c].split('/')[0]
                            }
                        });

                        if(constProducto)
                        {
                            // Validar sie xiste para modificar en lugar de insertar? ////////////////////////////////////////////////////////////////////////////////////////////
                            //Insertara cada archivo
                            for(var v = 0; v < existenArchivos.length; v++)
                            {
                                if( DIR === "./public/pdf/" )
                                {
                                    
                                console.log( constProducto.prod_producto_id )
                                console.log( existenArchivos[v] )
                                    const dataSheet = await models.ProductoDataSheet.findOne({
                                        where: {
                                            pds_prod_producto_id: constProducto.prod_producto_id,
                                            pds_nombre_data_sheet: existenArchivos[v]
                                        }
                                    });
                                    console.log( dataSheet )
                                    if (!!dataSheet) 
                                    {
                                        await dataSheet.update(  
                                        {
                                            pds_ruta_archivo: DIR + carpetasNameJson[c] + '/' + existenArchivos[v],
                                            pds_usu_usuario_creador_id: prod_usu_usuario_creador_id
                                        });
                                    }
                                    else
                                    {
                                        await models.ProductoDataSheet.create(
                                        {
                                            pds_prod_producto_id: constProducto.prod_producto_id,
                                            pds_nombre_data_sheet: existenArchivos[v],
                                            pds_ruta_archivo: DIR + carpetasNameJson[c] + '/' + existenArchivos[v],
                                            pds_usu_usuario_creador_id: prod_usu_usuario_creador_id
                                        });
                                    }
                                }
                                else 
                                {
                                    console.log("intentara insertar:" + existenArchivos[v])

                                    await models.ImagenProducto.create(
                                    {
                                        imgprod_prod_producto_id: constProducto.prod_producto_id,
                                        imgprod_nombre_archivo: existenArchivos[v],
                                        imgprod_ruta_archivo: DIR + carpetasNameJson[c] + '/' + existenArchivos[v],
                                        imgprod_usu_usuario_creador_id: prod_usu_usuario_creador_id
                                    });


                                }
                            }

                        }
                        else
                        {
                            console.log("producto no encontrado")
                        }
                    }
                }
            

            return true
        }
        catch(e){
            console.log(e)
            return "error al borrar zip"
        }
    },
};


