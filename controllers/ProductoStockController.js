import models from '../models';
import statusControles from '../mapeos/mapeoControlesMaestrosMultiples';
const { Op } = require("sequelize");
import {  Sequelize } from 'sequelize';
// import Producto from '../models/ProductoModel';
import Almacenes from '../models/AlmacenesModel';
const sequelize = new Sequelize(process.env.POSTGRESQL);
export default {

    getListProductosStock: async(req, res, next) =>{
        try{
            // const listaProductosStock = await models.StockProducto.findAll(
            // {
            //     attributes: 
            //     {
            //         exclude: ['sp_fecha_ingreso', 'createdAt', 'updatedAt', 'sp_usu_usuario_creador_id', 'sp_stock_producto_id']
            //     }
            // });

            const GetStock = await sequelize.query('SELECT pd.prod_sku as "prod_sku", sp.sp_stock_producto_id, sp.sp_prod_producto_id, sp.sp_cantidad, sp.sp_almacen_id   from stocks_productos sp left join productos pd on sp.sp_prod_producto_id = pd.prod_producto_id;', 
                { 
                    type: sequelize.QueryTypes.SELECT 
                });


            res.status(200).send({
                message: 'Lista de productos Stocks',
                GetStock
            })
        }catch(e){
            res.status(500).send({
                message: 'Error en la petición',
                e
            });
            next(e);
        }
    },
    
    getStokcFiltros: async(req, res, next) =>{
        try{
            // const listaProductosStock = await models.StockProducto.findAll(
            // {
            //     attributes: 
            //     {
            //         exclude: ['sp_fecha_ingreso', 'createdAt', 'updatedAt', 'sp_usu_usuario_creador_id', 'sp_stock_producto_id']
            //     }
            // });
            req.params.caso;
            req.params.valorBusqueda;
            var tempConsulta = '';
            console.log(req.params, tempConsulta);
            switch(req.params.caso){
                case '1': 
                    tempConsulta = "p.prod_sku like '%" + req.params.valorBusqueda + "%';";
                    
                    console.log('dentro', tempConsulta);
                    break;
                case '2': 
                    tempConsulta = "p.prod_producto_id = " + req.params.valorBusqueda + ";";
                    break;
                case '3': 
                    tempConsulta = "p.prod_descripcion like '%" + req.params.valorBusqueda + "%' ;";
                    break;
            }
            
            const GetStock = await sequelize.query(`
                select p.prod_producto_id, p.prod_descripcion, p.prod_descripcion_corta, p.prod_sku, p.prod_precio, p.prod_unidad_medida_venta,
                    (select SUM(sp2.sp_cantidad) 
                        from stocks_productos sp2 
                        inner join almacenes a2 
                            on sp2.sp_almacen_id = a2.alm_almacen_id 
                            and a2.alm_tipo_almacen = 1000057 
                        where sp2.sp_prod_producto_id = p.prod_producto_id 
                        group by sp2.sp_prod_producto_id) stock, 
                        (select SUM(sp3.sp_cantidad) 
                        from stocks_productos sp3 
                        where sp3.sp_prod_producto_id = p.prod_producto_id 
                        and sp3.sp_almacen_id = ` + req.params.idAlmacenVirtual  +` 
                        group by sp3.sp_prod_producto_id) stock_virtual 
                    from productos p 
                    where 
                    prod_prod_producto_padre_sku is not null and p.prod_cmm_estatus_id = 1000016 and   ` + tempConsulta, 
            { 
                type: sequelize.QueryTypes.SELECT 
            });

            res.status(200).send({
                message: 'Lista de productos Stocks',
                GetStock
            })
        }catch(e){
            res.status(500).send({
                message: 'Error en la petición',
                e
            });
            next(e);
        }
    },
    getListProductosStockByAlmacen: async(req, res, next) =>{
        try{
            const GetStock = await sequelize.query(
                'SELECT pd.prod_sku as "prod_sku", sp.sp_stock_producto_id, sp.sp_prod_producto_id, sp.sp_cantidad, sp.sp_almacen_id   from stocks_productos sp left join productos pd on sp.sp_prod_producto_id = pd.prod_producto_id ' +
                'where sp_almacen_id = ' + req.params.id , 
                { 
                    type: sequelize.QueryTypes.SELECT 
                });

            res.status(200).send({
                message: 'Lista de productos Stocks',
                GetStock
            })
        }catch(e){
            res.status(500).send({
                message: 'Error en la petición',
                e
            });
            next(e);
        }
    },
    getListProductosStockByMarca: async(req, res, next) =>{
        try
        {
            // await models.Almacenes.create(req.body)


            const GetStockMarca = await sequelize.query(
                'SELECT ' +
                    'pd.prod_sku as "prod_sku", ' +
                    'sp.sp_stock_producto_id, ' +
                    'sp.sp_prod_producto_id, ' +
                    'sp.sp_cantidad, ' +
                    'sp.sp_almacen_id ' +
                'from ' +
                    'stocks_productos sp ' +
                    'left join productos pd on sp.sp_prod_producto_id = pd.prod_producto_id ' +
                    'left join marcas mar on pd.prod_mar_marca_id = mar.mar_marca_id ' +
                'where sp.sp_almacen_id = ' + req.body.sp_almacen_id + " and mar.mar_nombre = '" + req.body.mar_nombre + "'" , 
                { 
                    type: sequelize.QueryTypes.SELECT 
                }
            );


            res.status(200).send(
            {

                message: 'Almacen creado exitosamente',
                GetStockMarca
            })
        }
        catch(e)
        {
            res.status(500).send(
            {
              message: 'Error al crear Almacen',
              e
            });
            next(e);
        }
    },
    getListProductosStockByCategoria: async(req, res, next) =>{
        try
        {
            // await models.Almacenes.create(req.body)


            const GetStockMarca = await sequelize.query(
                'SELECT ' +
                    'pd.prod_sku as "prod_sku", ' +
                    'sp.sp_stock_producto_id, ' +
                    'sp.sp_prod_producto_id, ' +
                    'sp.sp_cantidad, ' +
                    'sp.sp_almacen_id ' +
                'from ' +
                    'stocks_productos sp ' +
                    'left join productos pd on sp.sp_prod_producto_id = pd.prod_producto_id ' +
                    'left join categorias cat on pd.prod_cat_categoria_id = cat.cat_categoria_id ' +
                'where sp.sp_almacen_id = ' + req.body.sp_almacen_id + " and cat.cat_nombre = '" + req.body.cat_nombre + "'" , 
                { 
                    type: sequelize.QueryTypes.SELECT 
                }
            );


            res.status(200).send(
            {

                message: 'Almacen creado exitosamente',
                GetStockMarca
            })
        }
        catch(e)
        {
            res.status(500).send(
            {
              message: 'Error al crear Almacen',
              e
            });
            next(e);
        }
    },


    getListProductosStockBySKU: async(req, res, next) =>{
        try
        {
            // await models.Almacenes.create(req.body)


            const GetStockMarca = await sequelize.query(
                'SELECT ' +
                    'pd.prod_sku as "prod_sku", ' +
                    'sp.sp_stock_producto_id, ' +
                    'sp.sp_prod_producto_id, ' +
                    'sp.sp_cantidad, ' +
                    'sp.sp_almacen_id ' +
                'from ' +
                    'stocks_productos sp ' +
                    'left join productos pd on sp.sp_prod_producto_id = pd.prod_producto_id ' +
                'where sp.sp_almacen_id = ' + req.body.sp_almacen_id + "and pd.prod_sku like '%"+req.body.prod_sku+"%';" , 
                { 
                    type: sequelize.QueryTypes.SELECT 
                }
            );


            res.status(200).send(
            {

                message: 'Stock Listado por SKU',
                GetStockMarca
            })
        }
        catch(e)
        {
            res.status(500).send(
            {
              message: 'Error al crear Almacen',
              e
            });
            next(e);
        }
    },


    updateStockProducto: async(req, res, next) =>{
        try{
            const stock = await models.StockProducto.findOne({
                where: {
                    sp_prod_producto_id: req.body.sp_prod_producto_id,
                    sp_almacen_id: req.body.sp_almacen_id
                }
            });

            stock.update({
                sp_prod_producto_id: req.body.sp_prod_producto_id,
                sp_fecha_ingreso: Date(),
                sp_cantidad: req.body.sp_cantidad,
                sp_usu_usuario_creador_id: req.body.sp_usu_usuario_creador_id,
                sp_almacen_id: req.body.sp_almacen_id
            });
            res.status(200).send({
                message: 'Actualización de stock exitosa'
            })
        }catch(e){
            res.status(500).send({
                message: 'Error, al actualizar el stock',
                e
            });
            next(e);
        }
    }
}