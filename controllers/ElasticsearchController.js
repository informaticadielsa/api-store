import models from '../models';
import statusControles from '../mapeos/mapeoControlesMaestrosMultiples';
const { Op } = require("sequelize");
import {  Sequelize } from 'sequelize';
const sequelize = new Sequelize(process.env.POSTGRESQL);
import request from 'request-promise';
// const { Client } = require('@elastic/elasticsearch')

export default {

    createOrUpdate: async(req, res, next) =>{
        try
        {

            const totalProducts = await sequelize.query(
                `
                    select
                        p.prod_producto_id,
                        p.prod_nombre,
                        p.prod_nombre_extranjero,
                        p.prod_descripcion,
                        p.prod_sku,
                        p.prod_cmm_estatus_id,
                        p.prod_volumen,
                        p.prod_peso,
                        p.prod_mostrar_en_tienda,
                        m.mar_nombre,
                        m.mar_cmm_estatus_id,
                        m.mar_abreviatura,
                        c.cat_nombre,
                        c.cat_descripcion,
                        c.cat_cmm_estatus_id
                    from 
                        productos p
                        left join marcas m on cast( p.prod_codigo_marca as int ) = m.mar_marca_id 
                        left join categorias c on cast( p.prod_codigo_grupo as int ) = c.cat_categoria_id 
                    where 
                        p.prod_prod_producto_padre_sku is not null
                    order by 
                        p.prod_producto_id
                `, 
            { 
                type: sequelize.QueryTypes.SELECT 
            });


            for (var i = 0; i < totalProducts.length; i++) 
            // for (var i = 0; i < 2; i++) 
            {
                var user = 'elastic';
                var password = 'IMVO+l3KCG2ckZF+QLLC';
                var base64encodedData = Buffer.from(user + ':' + password).toString('base64');

                const options = {
                    method: 'POST',
                    url: 'https://localhost:9200/productos/_doc/' + totalProducts[i].prod_producto_id,
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: 'Basic ' + base64encodedData
                    },
                    body: {
                        prod_producto_id: totalProducts[i].prod_producto_id,
                        prod_sku: totalProducts[i].prod_sku,
                        prod_nombre: totalProducts[i].prod_nombre,
                        prod_descripcion: totalProducts[i].prod_descripcion,
                        prod_nombre_extranjero: totalProducts[i].prod_nombre_extranjero,
                        prod_cmm_estatus_id: totalProducts[i].prod_cmm_estatus_id,
                        prod_volumen: totalProducts[i].prod_volumen,
                        prod_peso: totalProducts[i].prod_peso,
                        prod_mostrar_en_tienda: totalProducts[i].prod_mostrar_en_tienda,
                        
                        cat_nombre: totalProducts[i].cat_nombre,
                        cat_descripcion: totalProducts[i].cat_descripcion,
                        cat_cmm_estatus_id: totalProducts[i].cat_cmm_estatus_id,

                        mar_nombre: totalProducts[i].mar_nombre,
                        mar_cmm_estatus_id: totalProducts[i].mar_cmm_estatus_id,
                        mar_abreviatura:  totalProducts[i].mar_abreviatura
                    },
                    json: true,
                    rejectUnauthorized : false
                };

                var result = await request(options, function (error, response) {
                });
            }

            res.status(200).send(
            {
                message: 'Todo bien',
                totalLenght: totalProducts.length,
                totalRecorrido: i
            });

            
        }
        catch(e)
        {
            console.log(e)
            res.status(500).send(
            {
                message: 'Error al crear Almacen',
                e
            });
            next(e);
        }
    },






    createOrUpdateWithLibrary: async(req, res, next) =>{
        try
        {

            // const totalProducts = await sequelize.query(
            //     `
            //         select
            //             p.prod_producto_id,
            //             p.prod_nombre,
            //             p.prod_nombre_extranjero,
            //             p.prod_descripcion,
            //             p.prod_sku,
            //             p.prod_cmm_estatus_id,
            //             m.mar_nombre,
            //             m.mar_abreviatura ,
            //             m.mar_cmm_estatus_id,
            //             c.cat_nombre ,
            //             c.cat_descripcion ,
            //             c.cat_cmm_estatus_id 
            //         from 
            //             productos p
            //             left join marcas m on cast( p.prod_codigo_marca as int ) = m.mar_marca_id 
            //             left join categorias c on cast( p.prod_codigo_grupo as int ) = c.cat_categoria_id 
            //         where 
            //             p.prod_prod_producto_padre_sku is not null
            //         order by 
            //             p.prod_producto_id
            //     `, 
            // { 
            //     type: sequelize.QueryTypes.SELECT 
            // });


            // for (var i = 0; i < totalProducts.length; i++) 
            // // for (var i = 0; i < 2; i++) 
            // {
            //     var user = 'elastic';
            //     var password = 'IMVO+l3KCG2ckZF+QLLC';
            //     var base64encodedData = Buffer.from(user + ':' + password).toString('base64');

            //     const options = {
            //         method: 'POST',
            //         url: 'https://localhost:9200/productostest/_doc/' + totalProducts[i].prod_producto_id,
            //         headers: {
            //             'Content-Type': 'application/json',
            //             Authorization: 'Basic ' + base64encodedData
            //         },
            //         body: {
            //             prod_producto_id: totalProducts[i].prod_producto_id,
            //             prod_sku: totalProducts[i].prod_sku,
            //             prod_nombre: totalProducts[i].prod_nombre,
            //             prod_descripcion: totalProducts[i].prod_descripcion,
            //             prod_nombre_extranjero: totalProducts[i].prod_nombre_extranjero,
            //             prod_cmm_estatus_id: totalProducts[i].prod_cmm_estatus_id,

            //             cat_nombre: totalProducts[i].cat_nombre,
            //             cat_descripcion: totalProducts[i].cat_descripcion,
            //             cat_cmm_estatus_id: totalProducts[i].cat_cmm_estatus_id,

            //             mar_nombre: totalProducts[i].mar_nombre,
            //             mar_cmm_estatus_id: totalProducts[i].mar_cmm_estatus_id,
            //             mar_abreviatura:  totalProducts[i].mar_abreviatura
            //         },
            //         json: true,
            //         rejectUnauthorized : false
            //     };

            //     var result = await request(options, function (error, response) {
            //     });
            // }





            // elastic 7.10
            // const client = new Client({
            //     node: 'https://localhost:9200',
            //     auth: {
            //         username: 'elastic',
            //         password: 'IMVO+l3KCG2ckZF+QLLC'
            //     },
            //     ssl: {
            //         rejectUnauthorized: false
            //     },
            //     ignore: [404],
            // })


            // const result = await client.search(
            // {
            //     index: 'productostest',
            //     // body: 
            //     // {
            //     //     query: {
                        
            //     //     }
            //     // }
            // })

            // console.log(result.body.hits)









            res.status(200).send(
            {
                message: 'Todo bien'
            });



            
        }
        catch(e)
        {
            console.log(e)
            res.status(500).send(
            {
                message: 'Error al crear Almacen',
                e
            });
            next(e);
        }
    },




    
 
}