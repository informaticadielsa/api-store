import models from '../models';
import { Sequelize } from 'sequelize';
const sequelize = new Sequelize(process.env.POSTGRESQL);
const { Op } = require("sequelize");
import statusControllers from '../mapeos/mapeoControlesMaestrosMultiples';

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

const cantidadAgregar = async function (cantidad, promocion){
    let productos_regalo = 0;
    if(promocion == statusControllers.TIPO_PROMOCION['3 X 2']){
        productos_regalo = cantidad / 3;
        console.log(productos_regalo);
        productos_regalo = Math.floor(productos_regalo);
        return  productos_regalo;
    }else if(promocion == statusControllers.TIPO_PROMOCION['2 X 1']){
        productos_regalo = cantidad / 2;
        productos_regalo = Math.floor(productos_regalo);
        return  productos_regalo;
    }
}

export default{
    updateCar: async(req, res, next) =>{
        try{
            const CarritoDeCompraUpdate = await models.CarritoDeCompra.findOne({
                where: {
                    cdc_carrito_de_compra_id : req.body.cdc_carrito_de_compra_id
                }
            });


            await CarritoDeCompraUpdate.update({
                cdc_total_carrito: !!req.body.cdc_total_carrito ? req.body.cdc_total_carrito : CarritoDeCompraUpdate.dataValues.cdc_total_carrito,
                cdc_cmm_tipo_envio_id: !!req.body.cdc_cmm_tipo_envio_id ? req.body.cdc_cmm_tipo_envio_id : CarritoDeCompraUpdate.dataValues.cdc_cmm_tipo_envio_id,
                cdc_direccion_envio_id: !!req.body.cdc_direccion_envio_id ? req.body.cdc_direccion_envio_id : CarritoDeCompraUpdate.dataValues.cdc_direccion_envio_id,
                cdc_alm_almacen_recoleccion: !!req.body.cdc_alm_almacen_recoleccion ? req.body.cdc_alm_almacen_recoleccion : CarritoDeCompraUpdate.dataValues.cdc_alm_almacen_recoleccion,
                cdc_cmm_tipo_compra_id: !!req.body.cdc_cmm_tipo_compra_id ? req.body.cdc_cmm_tipo_compra_id : CarritoDeCompraUpdate.dataValues.cdc_cmm_tipo_compra_id,
                cdc_fletera_id: !!req.body.cdc_fletera_id ? req.body.cdc_fletera_id : CarritoDeCompraUpdate.dataValues.cdc_fletera_id,
                cdc_costo_envio: !!req.body.cdc_costo_envio ? req.body.cdc_costo_envio : CarritoDeCompraUpdate.dataValues.cdc_costo_envio,
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


    //Creación de carrito de compras (Restructuración)
    createCarShop: async(req, res, next) =>{
        try{
            // const orden_carrito = String(Date.now()) + String(!!req.body.cdc_sn_socio_de_negocio_id ? req.body.cdc_sn_socio_de_negocio_id : 0 ) + String(!!req.body.cdc_usu_usuario_vendedor_id ? req.body.cdc_usu_usuario_vendedor_id : 0);


            //Buscara si el Socio de negocio tiene un carrito activo.
            var ultimoRowNum = 0
            const constCartLast = await models.CarritoDeCompra.findOne(
            {
                order: [
                    ['cdc_carrito_de_compra_id', 'DESC']
                ],
                limit: 1
            });


            if(constCartLast)
            {
                ultimoRowNum = constCartLast.cdc_carrito_de_compra_id
            }

            const orden_carrito = String(Date.now())+String(ultimoRowNum+1)

            var carrito_de_compra = {};
            if(!!req.body.pcdc_prod_producto_id){
                let socio_negocio;
                let id_carrito = 0;
                
                let almacen_virtual = 0;
                if(!!req.body.cdc_sn_socio_de_negocio_id){
                    socio_negocio = await models.SociosNegocio.findOne({
                        where: {
                            sn_socios_negocio_id: req.body.cdc_sn_socio_de_negocio_id
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
                    carrito_de_compra = await models.CarritoDeCompra.create({
                        cdc_numero_orden: orden_carrito,
                        cdc_usu_usuario_vendedor_id: !!req.body.cdc_usu_usuario_vendedor_id ? req.body.cdc_usu_usuario_vendedor_id : null,
                        cdc_sn_socio_de_negocio_id: !!req.body.cdc_sn_socio_de_negocio_id ? req.body.cdc_sn_socio_de_negocio_id : null,
                        cdc_lista_precio: !!socio_negocio  ? !!socio_negocio.dataValues.lista_de_precio ? socio_negocio.dataValues.lista_de_precio.dataValues.listp_lista_de_precio_id : null : null
                    });
                    id_carrito = carrito_de_compra.cdc_carrito_de_compra_id;
                    almacen_virtual = !!socio_negocio.dataValues.sn_almacen_asignado ? socio_negocio.sn_almacen_asignado : 0;
                }else{
                    carrito_de_compra = await models.CarritoDeCompra.create({
                        cdc_numero_orden: orden_carrito,
                        cdc_usu_usuario_vendedor_id: !!req.body.cdc_usu_usuario_vendedor_id ? req.body.cdc_usu_usuario_vendedor_id : null,
                        cdc_sn_socio_de_negocio_id: !!req.body.cdc_sn_socio_de_negocio_id ? req.body.cdc_sn_socio_de_negocio_id : null
                    });
                    id_carrito = carrito_de_compra.cdc_carrito_de_compra_id;
                }

                
                const listaPrecio = !!carrito_de_compra.cdc_lista_precio ? carrito_de_compra.cdc_lista_precio : 0;
                const socio = !!carrito_de_compra.cdc_sn_socio_de_negocio_id ? carrito_de_compra.cdc_sn_socio_de_negocio_id : 0;
                const carrito_id = !!carrito_de_compra.cdc_carrito_de_compra_id ? carrito_de_compra.cdc_carrito_de_compra_id : 0;
                let jsonToProject = [];
                if(!!carrito_de_compra){
                    //Validamos promociones activas
                    const producto_con_promocion =  await sequelize.query(`         
                    select 
                        *
                    from(
                        select
                            pd.promdes_promocion_descuento_id,
                            pd.promdes_fecha_inicio_validez, 
                            pd.promdes_fecha_finalizacion_validez,
                            pp.prodprom_prod_producto_id,
                            pd.promdes_tipo_descuento_id 
                        from promociones_descuentos pd
                        left join productos_promociones pp  on pp.prodprom_promdes_promocion_descuento_id  = pd.promdes_promocion_descuento_id 
                        where 
                            (promdes_tipo_descuento_id = ` + statusControllers.TIPO_PROMOCION['2 X 1'] + ` or promdes_tipo_descuento_id  = ` + statusControllers.TIPO_PROMOCION['3 X 2'] + `)
                            and
                                promdes_estatus_id  = ` + statusControllers.ESTATUS_PROMOCION.ACTIVA + `
                            and
                            (current_date between  promdes_fecha_inicio_validez and promdes_fecha_finalizacion_validez)
                            and 
                                promdes_cupon_descuento  is null
                    )productos
                    where productos.prodprom_prod_producto_id = ` + req.body.pcdc_prod_producto_id + `;`, 
                    { type: sequelize.QueryTypes.SELECT });
                    const mejor_precio =  await sequelize.query(`         
                    select
                        case 
                            when min(mejor_precio.prod_precio) <= 0 then max(mejor_precio.prod_precio) 
                            else
                                min(mejor_precio.prod_precio) 
                        end as min
                    from (
                        select 
                            prod_precio
                        from productos p 
                        where prod_producto_id  = ` + req.body.pcdc_prod_producto_id + `
                        union 
                        select
                            pldp.pl_precio_producto 
                        from productos_lista_de_precio pldp 
                        where pldp.pl_prod_producto_id = ` + req.body.pcdc_prod_producto_id + ` and pldp.pl_listp_lista_de_precio_id  = ` + listaPrecio + `
                    )mejor_precio;`, 
                    { type: sequelize.QueryTypes.SELECT });
                    const producto_regalo = await sequelize.query(`
                    select 
                    *
                    from(
                        select
                            pd.promdes_sku_gift,
                            pd.promdes_promocion_descuento_id,
                            pd.promdes_fecha_inicio_validez, 
                            pd.promdes_fecha_finalizacion_validez,
                            pp.prodprom_prod_producto_id,
                            pd.promdes_tipo_descuento_id 
                        from promociones_descuentos pd
                        left join productos_promociones pp  on pp.prodprom_promdes_promocion_descuento_id  = pd.promdes_promocion_descuento_id 
                        where 
                            (promdes_tipo_descuento_id = ` + statusControllers.TIPO_PROMOCION['Regalo'] + `)
                            and
                                promdes_estatus_id  = `+ statusControllers.ESTATUS_PROMOCION.ACTIVA +`
                            and
                            (current_date between  promdes_fecha_inicio_validez and promdes_fecha_finalizacion_validez)
                            and 
                                promdes_cupon_descuento  is null
                    )productos
                    where productos.prodprom_prod_producto_id = ` + req.body.pcdc_prod_producto_id + `;
                    `, { type: sequelize.QueryTypes.SELECT} );
                    const mejor_descuento = await sequelize.query(`
                    select
                        case 
                            when max(mejor_descuento.descuento) <= 9 then cast(concat(0, max(mejor_descuento.descuento)) as integer)
                            else max(mejor_descuento.descuento) 
                        end as mejor_descuento
                    from( 
                        select 
                            prod_descuento as descuento
                        from productos p 
                        where prod_producto_id  = ` + req.body.pcdc_prod_producto_id + `
                        union
                        select 
                            m.mar_descuento as descuento
                        from productos p2 
                        left join marcas m ON  m.mar_marca_id  = p2.prod_mar_marca_id  
                        where p2.prod_producto_id  = ` + req.body.pcdc_prod_producto_id + `
                        union 
                        select 
                            case 
                                when sn.sn_descuento >= ldp.listp_descuento then sn.sn_descuento
                                when ldp.listp_descuento >= sn.sn_descuento then ldp.listp_descuento
                            end as descuento
                        from socios_negocio sn 
                        left join listas_de_precios ldp on ldp.listp_lista_de_precio_id  = sn.sn_socios_negocio_id 
                        where sn.sn_socios_negocio_id  = ` + socio + `
                    )mejor_descuento;`, { type: sequelize.QueryTypes.SELECT });
                    const descuento_porcentaje_or_monto_fijo = await sequelize.query(`
                    select 
                        *
                    from(
                        select
                            pd.promdes_tipo_descuento_id,
                            pd.promdes_promocion_descuento_id,
                            pd.promdes_descuento_exacto,
                            pd.promdes_fecha_inicio_validez, 
                            pd.promdes_fecha_finalizacion_validez,
                            pp.prodprom_prod_producto_id,
                            pd.promdes_tipo_descuento_id 
                        from promociones_descuentos pd
                        left join productos_promociones pp  on pp.prodprom_promdes_promocion_descuento_id  = pd.promdes_promocion_descuento_id 
                        where 
                            (promdes_tipo_descuento_id = ` + statusControllers.TIPO_PROMOCION.Porcentaje + ` or promdes_tipo_descuento_id  = ` + statusControllers.TIPO_PROMOCION['Monto fijo'] + `)
                            and
                                promdes_estatus_id  = ` + statusControllers.ESTATUS_PROMOCION.ACTIVA + `
                            and
                            (current_date between  promdes_fecha_inicio_validez and promdes_fecha_finalizacion_validez)
                            and 
                            promdes_carrito_articulo is true
                            and 
                                promdes_cupon_descuento  is null
                    )productos
                    where productos.prodprom_prod_producto_id = ` +  req.body.pcdc_prod_producto_id + `
                    `, 
                    {
                        type: sequelize.QueryTypes.SELECT
                    })
                    if(producto_con_promocion.length > 0){
                        let regalados = await cantidadAgregar(req.body.pcdc_producto_cantidad, producto_con_promocion[0].promdes_tipo_descuento_id);
                        let total = await req.body.pcdc_producto_cantidad - regalados;
                        await models.ProductoCarritoDeCompra.create({
                                pcdc_carrito_de_compra_id: id_carrito,
                                pcdc_prod_producto_id: req.body.pcdc_prod_producto_id,
                                pcdc_producto_cantidad: total,
                                pcdc_prod_producto_id_promocion: req.body.pcdc_prod_producto_id,
                                pcdc_cantidad_producto_promocion: regalados,
                                pcdc_precio: mejor_precio[0].min,
                                pcdc_prod_producto_id_regalo: (producto_regalo.length > 0) ? producto_regalo[0].promdes_sku_gift : null,
                                pcdc_cantidad_producto_regalo: (producto_regalo.length > 0) ? req.body.pcdc_producto_cantidad : null,
                                pcdc_mejor_descuento: (mejor_descuento.length > 0) ?  mejor_descuento[0].mejor_descuento : 0,
                                pcdc_tipo_prmocion_individual: (descuento_porcentaje_or_monto_fijo.length > 0) ? descuento_porcentaje_or_monto_fijo[0].promdes_tipo_descuento_id : null,
                                pcdc_descuento_promocion: (descuento_porcentaje_or_monto_fijo.length > 0) ? descuento_porcentaje_or_monto_fijo[0].promdes_descuento_exacto : null
    
                        });
                    }else{
                        await models.ProductoCarritoDeCompra.create({
                            pcdc_carrito_de_compra_id: id_carrito,
                            pcdc_prod_producto_id: req.body.pcdc_prod_producto_id,
                            pcdc_producto_cantidad: req.body.pcdc_producto_cantidad,
                            pcdc_precio: mejor_precio[0].min,
                            pcdc_prod_producto_id_regalo: (producto_regalo.length > 0) ? producto_regalo[0].promdes_sku_gift : null,
                            pcdc_cantidad_producto_regalo: (producto_regalo.length > 0) ? req.body.pcdc_producto_cantidad : null,
                            pcdc_mejor_descuento: (mejor_descuento.length > 0) ?  mejor_descuento[0].mejor_descuento : 0,
                            pcdc_tipo_prmocion_individual: (descuento_porcentaje_or_monto_fijo.length > 0) ? descuento_porcentaje_or_monto_fijo[0].promdes_tipo_descuento_id : null,
                            pcdc_descuento_promocion: (descuento_porcentaje_or_monto_fijo.length > 0) ? descuento_porcentaje_or_monto_fijo[0].promdes_descuento_exacto : null
                        });
                    }
                    const marcas_con_limitantes = await sequelize.query(`
                    select
                        distinct(m.mar_marca_id)
                    from productos_carrito_de_compra pcdc 
                    left join productos p ON p.prod_producto_id  = pcdc.pcdc_prod_producto_id
                    left join marcas m on m.mar_marca_id  = p.prod_mar_marca_id 
                    where 
                        pcdc.pcdc_carrito_de_compra_id  = ` + carrito_id + `
                        and
                        m.mar_propiedades_extras is true
                    `,
                    {
                        type: sequelize.QueryTypes.SELECT    
                    });
                    const productos_de_proyecto = await sequelize.query(`
                    select
                        distinct(pc.pc_prod_producto_id) as producto 
                    from cotizaciones_proyectos cp 
                    inner join productos_cotizaciones pc on pc.pc_cot_cotizacion_id = cp.cot_cotizacion_id
                    where 
                        cp.cot_cmm_estatus_id  = ` + statusControllers.ESTATUS_COTIZACION_PROYECTO.ACTIVO + `
                        and
                        current_date between  current_date and cp.cot_fecha_vencimiento 
                        and 
                        cp.cot_sn_socios_negocio_id  = ` + socio + `;
                    `, {
                        type: sequelize.QueryTypes.SELECT
                    });
                    let idsProyectos = [];

                    if(productos_de_proyecto.length > 0){
                        productos_de_proyecto.forEach(async function(proyecto, indexProyecto){
                            idsProyectos.push(proyecto.producto);
                            if((productos_de_proyecto.length -1) == indexProyecto){
                                let to_ids = await idsProyectos.length > 0 ? idsProyectos : 0 ;
                                const productos_de_carrito_total = await sequelize.query(`
                                select
                                    count(distinct(pcdc.pcdc_prod_producto_id)) as incluidos
                                from carrito_de_compras cdc 
                                inner join productos_carrito_de_compra pcdc on pcdc.pcdc_carrito_de_compra_id  = cdc.cdc_carrito_de_compra_id 
                                where 
                                    cdc.cdc_carrito_de_compra_id  = ` + carrito_id + `
                                    and
                                    pcdc.pcdc_prod_producto_id  in (` + to_ids + `);            
                                `, {
                                    type: sequelize.QueryTypes.SELECT
                                });
        
                                const productos_de_carrito = await sequelize.query(`
                                select
                                    count(distinct(pcdc.pcdc_prod_producto_id)) as total
                                from carrito_de_compras cdc 
                                inner join productos_carrito_de_compra pcdc on pcdc.pcdc_carrito_de_compra_id  = cdc.cdc_carrito_de_compra_id 
                                where 
                                    cdc.cdc_carrito_de_compra_id  = ` + carrito_id + `;            
                                `, {
                                    type: sequelize.QueryTypes.SELECT
                                });
        
                                let porcentajeDeAprobacion = await Number(((Number(productos_de_carrito_total[0].incluidos) / Number(productos_de_carrito[0].total)) * 100).toFixed(2));
                    
                                if(marcas_con_limitantes.length > 0){
                                    marcas_con_limitantes.forEach(async function(marca, indexMarca){
                                        const validacionMarca = await sequelize.query(`
                                        select
                                            sum(sumatotal.precio_con_descuento) as total,
                                            sumatotal.marca,
                                            m.mar_importe,
                                            case 
                                                when m.mar_importe  < sum(sumatotal.precio_con_descuento) then true
                                                when m.mar_importe  > sum(sumatotal.precio_con_descuento) then false
                                            end as cumple
                                        from(
                                            select
                                                descuento.pcdc_producto_cantidad,
                                                descuento.prod_mar_marca_id as marca,
                                                case 
                                                    when descuento.pcdc_mejor_descuento >= 10 then  descuento.pcdc_producto_cantidad * (descuento.pcdc_precio -  (descuento.pcdc_precio * cast(concat('0.' || descuento.pcdc_mejor_descuento) as float)))
                                                    when descuento.pcdc_mejor_descuento <= 9 then   descuento.pcdc_producto_cantidad * (descuento.pcdc_precio -  (descuento.pcdc_precio * cast(concat('0.0' || descuento.pcdc_mejor_descuento) as float)))
                                                end as precio_con_descuento,
                                                *
                                            from (
                                                select 
                                                    *
                                                from productos_carrito_de_compra pcdc 
                                                left join productos p  on p.prod_producto_id  = pcdc.pcdc_prod_producto_id
                                                where 
                                                    pcdc.pcdc_carrito_de_compra_id  = ` + carrito_id + `
                                                    and 
                                                    p.prod_mar_marca_id  = ` + marca.mar_marca_id + `
                                            )descuento
                                        )sumatotal
                                        left join marcas m on m.mar_marca_id  = sumatotal.marca
                                        group  by sumatotal.marca, m.mar_importe;
                                        `, {
                                            type: sequelize.QueryTypes.SELECT
                                        });
                                        jsonToProject.push(validacionMarca[0]);
                                        if((marcas_con_limitantes.length -1) == indexMarca){
                                            const carrito_de_compra =  await models.CarritoDeCompra.findOne({
                                                where: {
                                                    cdc_carrito_de_compra_id: carrito_id
                                                },
                                                include: [
                                                    {
                                                        model: models.ProductoCarritoDeCompra,
                                                        attributes: {
                                                            exclude: [
                                                                'createdAt',
                                                                'updatedAt',
                                                            ]
                                                        }
                                                    }
                                                ]
                                            });
                                            carrito_de_compra.dataValues.productos_carrito_de_compras.forEach(async function(producto, indexProducto){
                                                const producto_carrito = await models.ProductoCarritoDeCompra.findOne({
                                                    where: {
                                                        pcdc_carrito_de_compra_id: producto.pcdc_carrito_de_compra_id,
                                                        pcdc_prod_producto_id: producto.pcdc_prod_producto_id
                                                    }
                                                });
                                                
                                                //Validamos promociones activas
                                                const producto_con_promocion =  await sequelize.query(`         
                                                select 
                                                    *
                                                from(
                                                    select
                                                        pd.promdes_promocion_descuento_id,
                                                        pd.promdes_fecha_inicio_validez, 
                                                        pd.promdes_fecha_finalizacion_validez,
                                                        pp.prodprom_prod_producto_id,
                                                        pd.promdes_tipo_descuento_id 
                                                    from promociones_descuentos pd
                                                    left join productos_promociones pp  on pp.prodprom_promdes_promocion_descuento_id  = pd.promdes_promocion_descuento_id 
                                                    where 
                                                        (promdes_tipo_descuento_id = ` + statusControllers.TIPO_PROMOCION['2 X 1'] + ` or promdes_tipo_descuento_id  = ` + statusControllers.TIPO_PROMOCION['3 X 2'] + `)
                                                        and
                                                            promdes_estatus_id  = ` + statusControllers.ESTATUS_PROMOCION.ACTIVA + `
                                                        and
                                                        (current_date between  promdes_fecha_inicio_validez and promdes_fecha_finalizacion_validez)
                                                        and 
                                                            promdes_cupon_descuento  is null
                                                )productos
                                                where productos.prodprom_prod_producto_id = ` + producto.pcdc_prod_producto_id + `;`, 
                                                { type: sequelize.QueryTypes.SELECT });
                                                const mejor_precio =  await sequelize.query(`         
                                                select
                                                    case 
                                                        when min(mejor_precio.prod_precio) <= 0 then max(mejor_precio.prod_precio) 
                                                        else
                                                            min(mejor_precio.prod_precio) 
                                                    end as min
                                                from (
                                                    select 
                                                        prod_precio
                                                    from productos p 
                                                    where prod_producto_id  = ` + producto.pcdc_prod_producto_id + `
                                                    union 
                                                    select
                                                        pldp.pl_precio_producto 
                                                    from productos_lista_de_precio pldp 
                                                    where pldp.pl_prod_producto_id = ` + producto.pcdc_prod_producto_id + ` and pldp.pl_listp_lista_de_precio_id  = ` + listaPrecio + `
                                                )mejor_precio;`, 
                                                { type: sequelize.QueryTypes.SELECT });
                                                const producto_regalo = await sequelize.query(`
                                                select 
                                                *
                                                from(
                                                    select
                                                        pd.promdes_sku_gift,
                                                        pd.promdes_promocion_descuento_id,
                                                        pd.promdes_fecha_inicio_validez, 
                                                        pd.promdes_fecha_finalizacion_validez,
                                                        pp.prodprom_prod_producto_id,
                                                        pd.promdes_tipo_descuento_id 
                                                    from promociones_descuentos pd
                                                    left join productos_promociones pp  on pp.prodprom_promdes_promocion_descuento_id  = pd.promdes_promocion_descuento_id 
                                                    where 
                                                        (promdes_tipo_descuento_id = ` + statusControllers.TIPO_PROMOCION['Regalo'] + `)
                                                        and
                                                            promdes_estatus_id  = `+ statusControllers.ESTATUS_PROMOCION.ACTIVA +`
                                                        and
                                                        (current_date between  promdes_fecha_inicio_validez and promdes_fecha_finalizacion_validez)
                                                        and 
                                                            promdes_cupon_descuento  is null
                                                )productos
                                                where productos.prodprom_prod_producto_id = ` + producto.pcdc_prod_producto_id + `;
                                                `, { type: sequelize.QueryTypes.SELECT} );
                                                const mejor_descuento = await sequelize.query(`
                                                select
                                                    case 
                                                        when max(mejor_descuento.descuento) <= 9 then cast(concat(0, max(mejor_descuento.descuento)) as integer)
                                                        else max(mejor_descuento.descuento) 
                                                    end as mejor_descuento
                                                from( 
                                                    select 
                                                        prod_descuento as descuento
                                                    from productos p 
                                                    where prod_producto_id  = ` + producto.pcdc_prod_producto_id + `
                                                    union
                                                    select 
                                                        m.mar_descuento as descuento
                                                    from productos p2 
                                                    left join marcas m ON  m.mar_marca_id  = p2.prod_mar_marca_id  
                                                    where p2.prod_producto_id  = ` + producto.pcdc_prod_producto_id + `
                                                    union 
                                                    select 
                                                        case 
                                                            when sn.sn_descuento >= ldp.listp_descuento then sn.sn_descuento
                                                            when ldp.listp_descuento >= sn.sn_descuento then ldp.listp_descuento
                                                        end as descuento
                                                    from socios_negocio sn 
                                                    left join listas_de_precios ldp on ldp.listp_lista_de_precio_id  = sn.sn_socios_negocio_id 
                                                    where sn.sn_socios_negocio_id  = ` + socio + `
                                                )mejor_descuento;`, { type: sequelize.QueryTypes.SELECT });
                                                const descuento_porcentaje_or_monto_fijo = await sequelize.query(`
                                                select 
                                                    *
                                                from(
                                                    select
                                                        pd.promdes_tipo_descuento_id,
                                                        pd.promdes_promocion_descuento_id,
                                                        pd.promdes_descuento_exacto,
                                                        pd.promdes_fecha_inicio_validez, 
                                                        pd.promdes_fecha_finalizacion_validez,
                                                        pp.prodprom_prod_producto_id,
                                                        pd.promdes_tipo_descuento_id 
                                                    from promociones_descuentos pd
                                                    left join productos_promociones pp  on pp.prodprom_promdes_promocion_descuento_id  = pd.promdes_promocion_descuento_id 
                                                    where 
                                                        (promdes_tipo_descuento_id = ` + statusControllers.TIPO_PROMOCION.Porcentaje + ` or promdes_tipo_descuento_id  = ` + statusControllers.TIPO_PROMOCION['Monto fijo'] + `)
                                                        and
                                                            promdes_estatus_id  = ` + statusControllers.ESTATUS_PROMOCION.ACTIVA + `
                                                        and
                                                        (current_date between  promdes_fecha_inicio_validez and promdes_fecha_finalizacion_validez)
                                                        and 
                                                        promdes_carrito_articulo is true
                                                        and 
                                                            promdes_cupon_descuento  is null
                                                )productos
                                                where productos.prodprom_prod_producto_id = ` +  producto.pcdc_prod_producto_id + `
                                                `, 
                                                {
                                                    type: sequelize.QueryTypes.SELECT
                                                });
                                                if(producto.pcdc_cupon_aplicado == false){
                                                    if(producto_con_promocion.length > 0){
                                                        let regalados = await cantidadAgregar(producto.pcdc_producto_cantidad, producto_con_promocion[0].promdes_tipo_descuento_id);
                                                        let total = await producto.pcdc_producto_cantidad - regalados;
                                                        producto_carrito.update({
                                                                pcdc_producto_cantidad: total,
                                                                pcdc_cantidad_producto_promocion: regalados,
                                                                pcdc_prod_producto_id_promocion: producto.pcdc_prod_producto_id,
                                                                pcdc_precio: mejor_precio[0].min,
                                                                pcdc_prod_producto_id_regalo: (producto_regalo.length > 0) ? producto_regalo[0].promdes_sku_gift : null,
                                                                pcdc_cantidad_producto_regalo: (producto_regalo.length > 0) ? producto.pcdc_producto_cantidad : null,
                                                                pcdc_mejor_descuento: (mejor_descuento.length > 0) ?  mejor_descuento[0].mejor_descuento : 0,
                                                                pcdc_tipo_prmocion_individual: (descuento_porcentaje_or_monto_fijo.length > 0) ? descuento_porcentaje_or_monto_fijo[0].promdes_tipo_descuento_id : null,
                                                                pcdc_descuento_promocion: (descuento_porcentaje_or_monto_fijo.length > 0) ? descuento_porcentaje_or_monto_fijo[0].promdes_descuento_exacto : null
        
                                                        });
                                                    }else{
                                                        producto_carrito.update({
                                                            pcdc_precio: mejor_precio[0].min,
                                                            pcdc_prod_producto_id_regalo: (producto_regalo.length > 0) ? producto_regalo[0].promdes_sku_gift : null,
                                                            pcdc_cantidad_producto_regalo: (producto_regalo.length > 0) ? producto.pcdc_producto_cantidad : null,
                                                            pcdc_mejor_descuento: (mejor_descuento.length > 0) ?  mejor_descuento[0].mejor_descuento : 0,
                                                            pcdc_tipo_prmocion_individual: (descuento_porcentaje_or_monto_fijo.length > 0) ? descuento_porcentaje_or_monto_fijo[0].promdes_tipo_descuento_id : null,
                                                            pcdc_descuento_promocion: (descuento_porcentaje_or_monto_fijo.length > 0) ? descuento_porcentaje_or_monto_fijo[0].promdes_descuento_exacto : null
                                                        });
                                                    }
                                                }
                                                //////////////////////////////////////////////// RETURN
                                                if((carrito_de_compra.dataValues.productos_carrito_de_compras.length -1) == indexProducto){
                                                    //REGRESAMO CARRITO DETALLE
                                                    const carrito_de_compra =  await models.CarritoDeCompra.findOne({
                                                        where: {
                                                            cdc_carrito_de_compra_id: carrito_id
                                                        }
                                                    });
                
                                                    const productos_carrito_de_compras = await models.ProductoCarritoDeCompra.findAll({
                                                        where: {
                                                            pcdc_carrito_de_compra_id: carrito_de_compra.dataValues.cdc_carrito_de_compra_id
                                                        },
                                                        order: [
                                                            ['pcdc_prod_producto_id', 'ASC']
                                                        ]
                                                    });

                                                    productos_carrito_de_compras.forEach(async function(producto, indexProducto){
                                                        const almacenes_fisicos = await models.Almacenes.findAll({
                                                            where: {
                                                                alm_cmm_estatus_id: statusControllers.ESTATUS_ALMACENES.ACTIVA,
                                                                alm_tipo_almacen: statusControllers.TIPO_ALMACEN.FISICO
                                                            }
                                                        });
                                                        const producto_carrito = await models.ProductoCarritoDeCompra.findOne({
                                                            where:{
                                                                pcdc_carrito_de_compra_id: producto.dataValues.pcdc_carrito_de_compra_id,
                                                                pcdc_prod_producto_id: producto.dataValues.pcdc_prod_producto_id
                                                            }
                                                        });
                                                        almacenes_fisicos.forEach(async function(almacenFisico, indexAlmacenFisico){
                                                            const almacen_origen = await sequelize.query(`
                                                            select 
                                                                distinct(total_stock.alm_almacen_id) as almacen,
                                                                total_stock.fisico as fisico,
                                                                case 
                                                                    when count(distinct(total_stock.fisico)) = 1  then
                                                                        sum(total_stock.sp_cantidad)
                                                                    when count(distinct(total_stock.fisico))  > 1 then
                                                                        total_stock.sp_cantidad
                                                                end as cantidad,
                                                                total_stock.prod_disponible_backorder
                                                            from( 
                                                                ---Almacen Fisico general tercer
                                                                select
                                                                    distinct (a.alm_almacen_id),
                                                                    a.alm_almacen_id as fisico,
                                                                    sp.sp_cantidad,
                                                                    p.prod_disponible_backorder
                                                                from almacenes a 
                                                                left join almacenes_logistica al  on al.almlog_almacen_codigo = a."alm_codigoAlmacen" 
                                                                left join stocks_productos sp ON sp.sp_almacen_id = a.alm_almacen_id 
                                                                left join productos p  on p.prod_producto_id  = sp.sp_prod_producto_id 
                                                                where sp.sp_almacen_id = ` + almacenFisico.dataValues.alm_almacen_id + ` and  a.alm_cmm_estatus_id = ` + statusControllers.ESTATUS_ALMACENES.ACTIVA + ` and sp.sp_prod_producto_id  = ` + producto.dataValues.pcdc_prod_producto_id + `
                                                                union 
                                                                ---Almacen virtual asignado a socio
                                                                select
                                                                    distinct(a.alm_almacen_id),
                                                                    a2.alm_almacen_id as fisico,
                                                                    sp.sp_cantidad,
                                                                    p2.prod_disponible_backorder
                                                                from almacenes a 
                                                                left join almacenes a2 on a2.alm_almacen_id = a.alm_fisico
                                                                left join stocks_productos sp on sp.sp_almacen_id  = a.alm_almacen_id 
                                                                left join productos p2 on p2.prod_producto_id  = sp.sp_prod_producto_id 
                                                                left join almacenes_logistica al on al.almlog_almacen_codigo = a2."alm_codigoAlmacen" 
                                                                where a.alm_almacen_id  = ` + almacen_virtual + ` and a.alm_cmm_estatus_id = ` + statusControllers.ESTATUS_ALMACENES.ACTIVA + ` and sp.sp_prod_producto_id  = ` + producto.dataValues.pcdc_prod_producto_id + `
                                                            )total_stock
                                                            group by total_stock.fisico, total_stock.sp_cantidad, total_stock.alm_almacen_id, total_stock.prod_disponible_backorder;
                                                            `, 
                                                            {
                                                                type: sequelize.QueryTypes.SELECT
                                                            });
                                                            console.log('RESULTADO CONSULTA ', almacen_origen, almacen_origen[0].cantidad, producto_carrito.dataValues.pcdc_producto_cantidad)
                                                            if(Number(almacen_origen[0].cantidad) > producto_carrito.dataValues.pcdc_producto_cantidad && (producto.dataValues.pcdc_validado == false)){
                                                                await producto_carrito.update({
                                                                    pcdc_almacen_surtido: almacen_origen[0].fisico,
                                                                    pcdc_validado: true
                                                                });
                                                            }if((Number(almacen_origen[0].cantidad) < producto_carrito.dataValues.pcdc_producto_cantidad) && (producto.dataValues.pcdc_validado == false)){
                                                                if((almacen_origen[0].prod_disponible_backorder) && (producto.dataValues.pcdc_validado == false)){
                                                                    await producto_carrito.update({
                                                                        pcdc_back_order: true,
                                                                        pcdc_validado: true
                                                                    });
                                                                }else if(producto.dataValues.pcdc_validado == false){
                                                                    await producto_carrito.update({
                                                                        pcdc_no_disponible_para_compra: true,
                                                                        pcdc_producto_cantidad: 0,
                                                                        pcdc_validado: true
                                                                    });
                                                                }
                                                            }
                                                            if((almacenes_fisicos.length -1) == indexAlmacenFisico){
                                                                if((productos_carrito_de_compras.length -1) == indexProducto){
                                                                    
                                                                    const productos_carrito_de_compras = await models.ProductoCarritoDeCompra.findAll({
                                                                        where: {
                                                                            pcdc_carrito_de_compra_id: carrito_de_compra.dataValues.cdc_carrito_de_compra_id
                                                                        },
                                                                        order: [
                                                                            ['pcdc_prod_producto_id', 'ASC']
                                                                        ],
                                                                        attributes: {
                                                                            exclude: ['pcdc_validado']
                                                                        },
                                                                        include: [
                                                                            {
                                                                                model: models.Producto,
                                                                                attributes: {
                                                                                    exclude: [
                                                                                        'prod_usu_usuario_creado_id',
                                                                                        'createdAt',
                                                                                        'prod_usu_usuario_modificado_id',
                                                                                        'updatedAt',
                                                                                        'prod_descripcion_corta',
                                                                                        'prod_unidad_medida_venta',
                                                                                        'prod_altura',
                                                                                        'prod_ancho',
                                                                                        'prod_longitud',
                                                                                        'prod_peso',
                                                                                        'prod_volumen',
                                                                                        'prod_total_stock',
                                                                                        'prod_proveedor_id',
                                                                                        'prod_meta_titulo',
                                                                                        'prod_meta_descripcion',
                                                                                        'prod_is_kit',
                                                                                        'prod_viñetas',
                                                                                        'prod_calificacion_promedio',
                                                                                        'prod_productos_coleccion_relacionados_id',
                                                                                        'prod_productos_coleccion_accesorios_id',
                                                                                        'prod_video_url'
                                                                                    ]
                                                                                },
                                                                                include: [
                                                                                    {
                                                                                        model: models.ImagenProducto,
                                                                                        attributes: {
                                                                                            exclude: [
                                                                                                'imgprod_imagen_producto_id',
                                                                                                'imgprod_usu_usuario_creador_id',
                                                                                                'createdAt',
                                                                                                'updatedAt'
                                                                                            ]
                                                                                        }
                                                                                    }
                                                                                ]
                                                                            }
                                                                        ]
                                                                    });
                                                                    res.status(200).send({
                                                                        message: 'Producto agregado correctamente.',
                                                                        carrito_de_compra,
                                                                        productos_carrito_de_compras,
                                                                        jsonToProject,
                                                                        porcentajeDeAprobacion
                                                                    });  
                                                                }
                                                            }
                                                        });                                                        
                                                    });
                                                }
                                            });
                                        }
                                    });
                                }else{
                                    const carrito_de_compra =  await models.CarritoDeCompra.findOne({
                                        where: {
                                            cdc_carrito_de_compra_id: carrito_id
                                        },
                                        include: [
                                            {
                                                model: models.ProductoCarritoDeCompra,
                                                attributes: {
                                                    exclude: [
                                                        'createdAt',
                                                        'updatedAt',
                                                    ]
                                                }
                                            }
                                        ]
                                    });
                                    carrito_de_compra.dataValues.productos_carrito_de_compras.forEach(async function(producto, indexProducto){
                                        const producto_carrito = await models.ProductoCarritoDeCompra.findOne({
                                            where: {
                                                pcdc_carrito_de_compra_id: producto.pcdc_carrito_de_compra_id,
                                                pcdc_prod_producto_id: producto.pcdc_prod_producto_id
                                            }
                                        });
                                        
                                        //Validamos promociones activas
                                        const producto_con_promocion =  await sequelize.query(`         
                                        select 
                                            *
                                        from(
                                            select
                                                pd.promdes_promocion_descuento_id,
                                                pd.promdes_fecha_inicio_validez, 
                                                pd.promdes_fecha_finalizacion_validez,
                                                pp.prodprom_prod_producto_id,
                                                pd.promdes_tipo_descuento_id 
                                            from promociones_descuentos pd
                                            left join productos_promociones pp  on pp.prodprom_promdes_promocion_descuento_id  = pd.promdes_promocion_descuento_id 
                                            where 
                                                (promdes_tipo_descuento_id = ` + statusControllers.TIPO_PROMOCION['2 X 1'] + ` or promdes_tipo_descuento_id  = ` + statusControllers.TIPO_PROMOCION['3 X 2'] + `)
                                                and
                                                    promdes_estatus_id  = ` + statusControllers.ESTATUS_PROMOCION.ACTIVA + `
                                                and
                                                (current_date between  promdes_fecha_inicio_validez and promdes_fecha_finalizacion_validez)
                                                and 
                                                    promdes_cupon_descuento  is null
                                        )productos
                                        where productos.prodprom_prod_producto_id = ` + producto.pcdc_prod_producto_id + `;`, 
                                        { type: sequelize.QueryTypes.SELECT });
                                        const mejor_precio =  await sequelize.query(`         
                                        select
                                            case 
                                                when min(mejor_precio.prod_precio) <= 0 then max(mejor_precio.prod_precio) 
                                                else
                                                    min(mejor_precio.prod_precio) 
                                            end as min
                                        from (
                                            select 
                                                prod_precio
                                            from productos p 
                                            where prod_producto_id  = ` + producto.pcdc_prod_producto_id + `
                                            union 
                                            select
                                                pldp.pl_precio_producto 
                                            from productos_lista_de_precio pldp 
                                            where pldp.pl_prod_producto_id = ` + producto.pcdc_prod_producto_id + ` and pldp.pl_listp_lista_de_precio_id  = ` + listaPrecio + `
                                        )mejor_precio;`, 
                                        { type: sequelize.QueryTypes.SELECT });
                                        const producto_regalo = await sequelize.query(`
                                        select 
                                        *
                                        from(
                                            select
                                                pd.promdes_sku_gift,
                                                pd.promdes_promocion_descuento_id,
                                                pd.promdes_fecha_inicio_validez, 
                                                pd.promdes_fecha_finalizacion_validez,
                                                pp.prodprom_prod_producto_id,
                                                pd.promdes_tipo_descuento_id 
                                            from promociones_descuentos pd
                                            left join productos_promociones pp  on pp.prodprom_promdes_promocion_descuento_id  = pd.promdes_promocion_descuento_id 
                                            where 
                                                (promdes_tipo_descuento_id = ` + statusControllers.TIPO_PROMOCION['Regalo'] + `)
                                                and
                                                    promdes_estatus_id  = `+ statusControllers.ESTATUS_PROMOCION.ACTIVA +`
                                                and
                                                (current_date between  promdes_fecha_inicio_validez and promdes_fecha_finalizacion_validez)
                                                and 
                                                    promdes_cupon_descuento  is null
                                        )productos
                                        where productos.prodprom_prod_producto_id = ` + producto.pcdc_prod_producto_id + `;
                                        `, { type: sequelize.QueryTypes.SELECT} );
                                        const mejor_descuento = await sequelize.query(`
                                        select
                                            case 
                                                when max(mejor_descuento.descuento) <= 9 then cast(concat(0, max(mejor_descuento.descuento)) as integer)
                                                else max(mejor_descuento.descuento) 
                                            end as mejor_descuento
                                        from( 
                                            select 
                                                prod_descuento as descuento
                                            from productos p 
                                            where prod_producto_id  = ` + producto.pcdc_prod_producto_id + `
                                            union
                                            select 
                                                m.mar_descuento as descuento
                                            from productos p2 
                                            left join marcas m ON  m.mar_marca_id  = p2.prod_mar_marca_id  
                                            where p2.prod_producto_id  = ` + producto.pcdc_prod_producto_id + `
                                            union 
                                            select 
                                                case 
                                                    when sn.sn_descuento >= ldp.listp_descuento then sn.sn_descuento
                                                    when ldp.listp_descuento >= sn.sn_descuento then ldp.listp_descuento
                                                end as descuento
                                            from socios_negocio sn 
                                            left join listas_de_precios ldp on ldp.listp_lista_de_precio_id  = sn.sn_socios_negocio_id 
                                            where sn.sn_socios_negocio_id  = ` + socio + `
                                        )mejor_descuento;`, { type: sequelize.QueryTypes.SELECT });
                                        const descuento_porcentaje_or_monto_fijo = await sequelize.query(`
                                        select 
                                            *
                                        from(
                                            select
                                                pd.promdes_tipo_descuento_id,
                                                pd.promdes_promocion_descuento_id,
                                                pd.promdes_descuento_exacto,
                                                pd.promdes_fecha_inicio_validez, 
                                                pd.promdes_fecha_finalizacion_validez,
                                                pp.prodprom_prod_producto_id,
                                                pd.promdes_tipo_descuento_id 
                                            from promociones_descuentos pd
                                            left join productos_promociones pp  on pp.prodprom_promdes_promocion_descuento_id  = pd.promdes_promocion_descuento_id 
                                            where 
                                                (promdes_tipo_descuento_id = ` + statusControllers.TIPO_PROMOCION.Porcentaje + ` or promdes_tipo_descuento_id  = ` + statusControllers.TIPO_PROMOCION['Monto fijo'] + `)
                                                and
                                                    promdes_estatus_id  = ` + statusControllers.ESTATUS_PROMOCION.ACTIVA + `
                                                and
                                                (current_date between  promdes_fecha_inicio_validez and promdes_fecha_finalizacion_validez)
                                                and 
                                                promdes_carrito_articulo is true
                                                and 
                                                    promdes_cupon_descuento  is null
                                        )productos
                                        where productos.prodprom_prod_producto_id = ` +  producto.pcdc_prod_producto_id + `
                                        `, 
                                        {
                                            type: sequelize.QueryTypes.SELECT
                                        })
                                        if(producto.pcdc_cupon_aplicado == false){
                                            if(producto_con_promocion.length > 0){
                                                let regalados = await cantidadAgregar(producto.pcdc_producto_cantidad, producto_con_promocion[0].promdes_tipo_descuento_id);
                                                let total = await producto.pcdc_producto_cantidad - regalados;
                                                producto_carrito.update({
                                                        pcdc_producto_cantidad: total,
                                                        pcdc_prod_producto_id_promocion: producto.pcdc_prod_producto_id,
                                                        pcdc_cantidad_producto_promocion: regalados,
                                                        pcdc_precio: mejor_precio[0].min,
                                                        pcdc_prod_producto_id_regalo: (producto_regalo.length > 0) ? producto_regalo[0].promdes_sku_gift : null,
                                                        pcdc_cantidad_producto_regalo: (producto_regalo.length > 0) ? producto.pcdc_producto_cantidad : null,
                                                        pcdc_mejor_descuento: (mejor_descuento.length > 0) ?  mejor_descuento[0].mejor_descuento : 0,
                                                        pcdc_tipo_prmocion_individual: (descuento_porcentaje_or_monto_fijo.length > 0) ? descuento_porcentaje_or_monto_fijo[0].promdes_tipo_descuento_id : null,
                                                        pcdc_descuento_promocion: (descuento_porcentaje_or_monto_fijo.length > 0) ? descuento_porcentaje_or_monto_fijo[0].promdes_descuento_exacto : null
        
                                                });
                                            }else{
                                                producto_carrito.update({
                                                    pcdc_precio: mejor_precio[0].min,
                                                    pcdc_prod_producto_id_regalo: (producto_regalo.length > 0) ? producto_regalo[0].promdes_sku_gift : null,
                                                    pcdc_cantidad_producto_regalo: (producto_regalo.length > 0) ? producto.pcdc_producto_cantidad : null,
                                                    pcdc_mejor_descuento: (mejor_descuento.length > 0) ?  mejor_descuento[0].mejor_descuento : 0,
                                                    pcdc_tipo_prmocion_individual: (descuento_porcentaje_or_monto_fijo.length > 0) ? descuento_porcentaje_or_monto_fijo[0].promdes_tipo_descuento_id : null,
                                                    pcdc_descuento_promocion: (descuento_porcentaje_or_monto_fijo.length > 0) ? descuento_porcentaje_or_monto_fijo[0].promdes_descuento_exacto : null
                                                });
                                            }
                                        }
                                        ////////////////////////////////////////////////////// RETURN
                                        if((carrito_de_compra.dataValues.productos_carrito_de_compras.length -1) == indexProducto){
                                            //REGRESAMO CARRITO DETALLE
                                            const carrito_de_compra =  await models.CarritoDeCompra.findOne({
                                                where: {
                                                    cdc_carrito_de_compra_id: carrito_id
                                                }
                                            });
        
                                            const productos_carrito_de_compras = await models.ProductoCarritoDeCompra.findAll({
                                                where: {
                                                    pcdc_carrito_de_compra_id: carrito_de_compra.dataValues.cdc_carrito_de_compra_id
                                                },
                                                order: [
                                                    ['pcdc_prod_producto_id', 'ASC']
                                                ]
                                            });

                                            productos_carrito_de_compras.forEach(async function(producto, indexProducto){
                                                const almacenes_fisicos = await models.Almacenes.findAll({
                                                    where: {
                                                        alm_cmm_estatus_id: statusControllers.ESTATUS_ALMACENES.ACTIVA,
                                                        alm_tipo_almacen: statusControllers.TIPO_ALMACEN.FISICO
                                                    }
                                                });
                                                const producto_carrito = await models.ProductoCarritoDeCompra.findOne({
                                                    where:{
                                                        pcdc_carrito_de_compra_id: producto.dataValues.pcdc_carrito_de_compra_id,
                                                        pcdc_prod_producto_id: producto.dataValues.pcdc_prod_producto_id
                                                    }
                                                });
                                                almacenes_fisicos.forEach(async function(almacenFisico, indexAlmacenFisico){
                                                    const almacen_origen = await sequelize.query(`
                                                    select 
                                                        distinct(total_stock.alm_almacen_id) as almacen,
                                                        total_stock.fisico as fisico,
                                                        case 
                                                            when count(distinct(total_stock.fisico)) = 1  then
                                                                sum(total_stock.sp_cantidad)
                                                            when count(distinct(total_stock.fisico))  > 1 then
                                                                total_stock.sp_cantidad
                                                        end as cantidad,
                                                        total_stock.prod_disponible_backorder
                                                    from( 
                                                        ---Almacen Fisico general tercer
                                                        select
                                                            distinct (a.alm_almacen_id),
                                                            a.alm_almacen_id as fisico,
                                                            sp.sp_cantidad,
                                                            p.prod_disponible_backorder
                                                        from almacenes a 
                                                        left join almacenes_logistica al  on al.almlog_almacen_codigo = a."alm_codigoAlmacen" 
                                                        left join stocks_productos sp ON sp.sp_almacen_id = a.alm_almacen_id 
                                                        left join productos p  on p.prod_producto_id  = sp.sp_prod_producto_id 
                                                        where sp.sp_almacen_id = ` + almacenFisico.dataValues.alm_almacen_id + ` and  a.alm_cmm_estatus_id = ` + statusControllers.ESTATUS_ALMACENES.ACTIVA + ` and sp.sp_prod_producto_id  = ` + producto.dataValues.pcdc_prod_producto_id + `
                                                        union 
                                                        ---Almacen virtual asignado a socio
                                                        select
                                                            distinct(a.alm_almacen_id),
                                                            a2.alm_almacen_id as fisico,
                                                            sp.sp_cantidad,
                                                            p2.prod_disponible_backorder
                                                        from almacenes a 
                                                        left join almacenes a2 on a2.alm_almacen_id = a.alm_fisico
                                                        left join stocks_productos sp on sp.sp_almacen_id  = a.alm_almacen_id 
                                                        left join productos p2 on p2.prod_producto_id  = sp.sp_prod_producto_id 
                                                        left join almacenes_logistica al on al.almlog_almacen_codigo = a2."alm_codigoAlmacen" 
                                                        where a.alm_almacen_id  = ` + almacen_virtual + ` and a.alm_cmm_estatus_id = ` + statusControllers.ESTATUS_ALMACENES.ACTIVA + ` and sp.sp_prod_producto_id  = ` + producto.dataValues.pcdc_prod_producto_id + `
                                                    )total_stock
                                                    group by total_stock.fisico, total_stock.sp_cantidad, total_stock.alm_almacen_id, total_stock.prod_disponible_backorder;
                                                    `, 
                                                    {
                                                        type: sequelize.QueryTypes.SELECT
                                                    });
                                                    console.log('RESULTADO CONSULTA ', almacen_origen, almacen_origen[0].cantidad, producto_carrito.dataValues.pcdc_producto_cantidad)
                                                    if(Number(almacen_origen[0].cantidad) > producto_carrito.dataValues.pcdc_producto_cantidad && (producto.dataValues.pcdc_validado == false)){
                                                        await producto_carrito.update({
                                                            pcdc_almacen_surtido: almacen_origen[0].fisico,
                                                            pcdc_validado: true
                                                        });
                                                    }if((Number(almacen_origen[0].cantidad) < producto_carrito.dataValues.pcdc_producto_cantidad) && (producto.dataValues.pcdc_validado == false)){
                                                        if((almacen_origen[0].prod_disponible_backorder) && (producto.dataValues.pcdc_validado == false)){
                                                            await producto_carrito.update({
                                                                pcdc_back_order: true,
                                                                pcdc_validado: true
                                                            });
                                                        }else if(producto.dataValues.pcdc_validado == false){
                                                            await producto_carrito.update({
                                                                pcdc_no_disponible_para_compra: true,
                                                                pcdc_producto_cantidad: 0,
                                                                pcdc_validado: true
                                                            });
                                                        }
                                                    }
                                                    if((almacenes_fisicos.length -1) == indexAlmacenFisico){
                                                        if((productos_carrito_de_compras.length -1) == indexProducto){
                                                            
                                                            const productos_carrito_de_compras = await models.ProductoCarritoDeCompra.findAll({
                                                                where: {
                                                                    pcdc_carrito_de_compra_id: carrito_de_compra.dataValues.cdc_carrito_de_compra_id
                                                                },
                                                                order: [
                                                                    ['pcdc_prod_producto_id', 'ASC']
                                                                ],
                                                                attributes: {
                                                                    exclude: ['pcdc_validado']
                                                                },
                                                                include: [
                                                                    {
                                                                        model: models.Producto,
                                                                        attributes: {
                                                                            exclude: [
                                                                                'prod_usu_usuario_creado_id',
                                                                                'createdAt',
                                                                                'prod_usu_usuario_modificado_id',
                                                                                'updatedAt',
                                                                                'prod_descripcion_corta',
                                                                                'prod_unidad_medida_venta',
                                                                                'prod_altura',
                                                                                'prod_ancho',
                                                                                'prod_longitud',
                                                                                'prod_peso',
                                                                                'prod_volumen',
                                                                                'prod_total_stock',
                                                                                'prod_proveedor_id',
                                                                                'prod_meta_titulo',
                                                                                'prod_meta_descripcion',
                                                                                'prod_is_kit',
                                                                                'prod_viñetas',
                                                                                'prod_calificacion_promedio',
                                                                                'prod_productos_coleccion_relacionados_id',
                                                                                'prod_productos_coleccion_accesorios_id',
                                                                                'prod_video_url'
                                                                            ]
                                                                        },
                                                                        include: [
                                                                            {
                                                                                model: models.ImagenProducto,
                                                                                attributes: {
                                                                                    exclude: [
                                                                                        'imgprod_imagen_producto_id',
                                                                                        'imgprod_usu_usuario_creador_id',
                                                                                        'createdAt',
                                                                                        'updatedAt'
                                                                                    ]
                                                                                }
                                                                            }
                                                                        ]
                                                                    }
                                                                ]
                                                            });
                                                            res.status(200).send({
                                                                message: 'Producto agregado correctamente.',
                                                                carrito_de_compra,
                                                                productos_carrito_de_compras,
                                                                jsonToProject,
                                                                porcentajeDeAprobacion
                                                            });  
                                                        }
                                                    }
                                                });                                                        
                                            });
                                        }
                                    });
        
                                }
                            }
                        });
                    }else{
                        let to_ids = await idsProyectos.length > 0 ? idsProyectos : 0 ;
                        const productos_de_carrito_total = await sequelize.query(`
                        select
                            count(distinct(pcdc.pcdc_prod_producto_id)) as incluidos
                        from carrito_de_compras cdc 
                        inner join productos_carrito_de_compra pcdc on pcdc.pcdc_carrito_de_compra_id  = cdc.cdc_carrito_de_compra_id 
                        where 
                            cdc.cdc_carrito_de_compra_id  = ` + carrito_id + `
                            and
                            pcdc.pcdc_prod_producto_id  in (` + to_ids + `);            
                        `, {
                            type: sequelize.QueryTypes.SELECT
                        });
    
                        const productos_de_carrito = await sequelize.query(`
                        select
                            count(distinct(pcdc.pcdc_prod_producto_id)) as total
                        from carrito_de_compras cdc 
                        inner join productos_carrito_de_compra pcdc on pcdc.pcdc_carrito_de_compra_id  = cdc.cdc_carrito_de_compra_id 
                        where 
                            cdc.cdc_carrito_de_compra_id  = ` + carrito_id + `;            
                        `, {
                            type: sequelize.QueryTypes.SELECT
                        });
    
                        let porcentajeDeAprobacion = await Number(((Number(productos_de_carrito_total[0].incluidos) / Number(productos_de_carrito[0].total)) * 100).toFixed(2));
                        
                        if(marcas_con_limitantes.length > 0){
                            marcas_con_limitantes.forEach(async function(marca, indexMarca){
                                const validacionMarca = await sequelize.query(`
                                select
                                    sum(sumatotal.precio_con_descuento) as total,
                                    sumatotal.marca,
                                    m.mar_importe,
                                    case 
                                        when m.mar_importe  < sum(sumatotal.precio_con_descuento) then true
                                        when m.mar_importe  > sum(sumatotal.precio_con_descuento) then false
                                    end as cumple
                                from(
                                    select
                                        descuento.pcdc_producto_cantidad,
                                        descuento.prod_mar_marca_id as marca,
                                        case 
                                            when descuento.pcdc_mejor_descuento >= 10 then  descuento.pcdc_producto_cantidad * (descuento.pcdc_precio -  (descuento.pcdc_precio * cast(concat('0.' || descuento.pcdc_mejor_descuento) as float)))
                                            when descuento.pcdc_mejor_descuento <= 9 then   descuento.pcdc_producto_cantidad * (descuento.pcdc_precio -  (descuento.pcdc_precio * cast(concat('0.0' || descuento.pcdc_mejor_descuento) as float)))
                                        end as precio_con_descuento,
                                        *
                                    from (
                                        select 
                                            *
                                        from productos_carrito_de_compra pcdc 
                                        left join productos p  on p.prod_producto_id  = pcdc.pcdc_prod_producto_id
                                        where 
                                            pcdc.pcdc_carrito_de_compra_id  = ` + carrito_id + `
                                            and 
                                            p.prod_mar_marca_id  = ` + marca.mar_marca_id + `
                                    )descuento
                                )sumatotal
                                left join marcas m on m.mar_marca_id  = sumatotal.marca
                                group  by sumatotal.marca, m.mar_importe;
                                `, {
                                    type: sequelize.QueryTypes.SELECT
                                });
                                jsonToProject.push(validacionMarca[0]);
                                if((marcas_con_limitantes.length -1) == indexMarca){
                                    const carrito_de_compra =  await models.CarritoDeCompra.findOne({
                                        where: {
                                            cdc_carrito_de_compra_id: carrito_id
                                        },
                                        include: [
                                            {
                                                model: models.ProductoCarritoDeCompra,
                                                attributes: {
                                                    exclude: [
                                                        'createdAt',
                                                        'updatedAt',
                                                    ]
                                                }
                                            }
                                        ]
                                    });
                                    carrito_de_compra.dataValues.productos_carrito_de_compras.forEach(async function(producto, indexProducto){
                                        const producto_carrito = await models.ProductoCarritoDeCompra.findOne({
                                            where: {
                                                pcdc_carrito_de_compra_id: producto.pcdc_carrito_de_compra_id,
                                                pcdc_prod_producto_id: producto.pcdc_prod_producto_id
                                            }
                                        });
                                        
                                        //Validamos promociones activas
                                        const producto_con_promocion =  await sequelize.query(`         
                                        select 
                                            *
                                        from(
                                            select
                                                pd.promdes_promocion_descuento_id,
                                                pd.promdes_fecha_inicio_validez, 
                                                pd.promdes_fecha_finalizacion_validez,
                                                pp.prodprom_prod_producto_id,
                                                pd.promdes_tipo_descuento_id 
                                            from promociones_descuentos pd
                                            left join productos_promociones pp  on pp.prodprom_promdes_promocion_descuento_id  = pd.promdes_promocion_descuento_id 
                                            where 
                                                (promdes_tipo_descuento_id = ` + statusControllers.TIPO_PROMOCION['2 X 1'] + ` or promdes_tipo_descuento_id  = ` + statusControllers.TIPO_PROMOCION['3 X 2'] + `)
                                                and
                                                    promdes_estatus_id  = ` + statusControllers.ESTATUS_PROMOCION.ACTIVA + `
                                                and
                                                (current_date between  promdes_fecha_inicio_validez and promdes_fecha_finalizacion_validez)
                                                and 
                                                    promdes_cupon_descuento  is null
                                        )productos
                                        where productos.prodprom_prod_producto_id = ` + producto.pcdc_prod_producto_id + `;`, 
                                        { type: sequelize.QueryTypes.SELECT });
                                        const mejor_precio =  await sequelize.query(`         
                                        select
                                            case 
                                                when min(mejor_precio.prod_precio) <= 0 then max(mejor_precio.prod_precio) 
                                                else
                                                    min(mejor_precio.prod_precio) 
                                            end as min
                                        from (
                                            select 
                                                prod_precio
                                            from productos p 
                                            where prod_producto_id  = ` + producto.pcdc_prod_producto_id + `
                                            union 
                                            select
                                                pldp.pl_precio_producto 
                                            from productos_lista_de_precio pldp 
                                            where pldp.pl_prod_producto_id = ` + producto.pcdc_prod_producto_id + ` and pldp.pl_listp_lista_de_precio_id  = ` + listaPrecio + `
                                        )mejor_precio;`, 
                                        { type: sequelize.QueryTypes.SELECT });
                                        const producto_regalo = await sequelize.query(`
                                        select 
                                        *
                                        from(
                                            select
                                                pd.promdes_sku_gift,
                                                pd.promdes_promocion_descuento_id,
                                                pd.promdes_fecha_inicio_validez, 
                                                pd.promdes_fecha_finalizacion_validez,
                                                pp.prodprom_prod_producto_id,
                                                pd.promdes_tipo_descuento_id 
                                            from promociones_descuentos pd
                                            left join productos_promociones pp  on pp.prodprom_promdes_promocion_descuento_id  = pd.promdes_promocion_descuento_id 
                                            where 
                                                (promdes_tipo_descuento_id = ` + statusControllers.TIPO_PROMOCION['Regalo'] + `)
                                                and
                                                    promdes_estatus_id  = `+ statusControllers.ESTATUS_PROMOCION.ACTIVA +`
                                                and
                                                (current_date between  promdes_fecha_inicio_validez and promdes_fecha_finalizacion_validez)
                                                and 
                                                    promdes_cupon_descuento  is null
                                        )productos
                                        where productos.prodprom_prod_producto_id = ` + producto.pcdc_prod_producto_id + `;
                                        `, { type: sequelize.QueryTypes.SELECT} );
                                        const mejor_descuento = await sequelize.query(`
                                        select
                                            case 
                                                when max(mejor_descuento.descuento) <= 9 then cast(concat(0, max(mejor_descuento.descuento)) as integer)
                                                else max(mejor_descuento.descuento) 
                                            end as mejor_descuento
                                        from( 
                                            select 
                                                prod_descuento as descuento
                                            from productos p 
                                            where prod_producto_id  = ` + producto.pcdc_prod_producto_id + `
                                            union
                                            select 
                                                m.mar_descuento as descuento
                                            from productos p2 
                                            left join marcas m ON  m.mar_marca_id  = p2.prod_mar_marca_id  
                                            where p2.prod_producto_id  = ` + producto.pcdc_prod_producto_id + `
                                            union 
                                            select 
                                                case 
                                                    when sn.sn_descuento >= ldp.listp_descuento then sn.sn_descuento
                                                    when ldp.listp_descuento >= sn.sn_descuento then ldp.listp_descuento
                                                end as descuento
                                            from socios_negocio sn 
                                            left join listas_de_precios ldp on ldp.listp_lista_de_precio_id  = sn.sn_socios_negocio_id 
                                            where sn.sn_socios_negocio_id  = ` + socio + `
                                        )mejor_descuento;`, { type: sequelize.QueryTypes.SELECT });
                                        const descuento_porcentaje_or_monto_fijo = await sequelize.query(`
                                        select 
                                            *
                                        from(
                                            select
                                                pd.promdes_tipo_descuento_id,
                                                pd.promdes_promocion_descuento_id,
                                                pd.promdes_descuento_exacto,
                                                pd.promdes_fecha_inicio_validez, 
                                                pd.promdes_fecha_finalizacion_validez,
                                                pp.prodprom_prod_producto_id,
                                                pd.promdes_tipo_descuento_id 
                                            from promociones_descuentos pd
                                            left join productos_promociones pp  on pp.prodprom_promdes_promocion_descuento_id  = pd.promdes_promocion_descuento_id 
                                            where 
                                                (promdes_tipo_descuento_id = ` + statusControllers.TIPO_PROMOCION.Porcentaje + ` or promdes_tipo_descuento_id  = ` + statusControllers.TIPO_PROMOCION['Monto fijo'] + `)
                                                and
                                                    promdes_estatus_id  = ` + statusControllers.ESTATUS_PROMOCION.ACTIVA + `
                                                and
                                                (current_date between  promdes_fecha_inicio_validez and promdes_fecha_finalizacion_validez)
                                                and 
                                                promdes_carrito_articulo is true
                                                and 
                                                    promdes_cupon_descuento  is null
                                        )productos
                                        where productos.prodprom_prod_producto_id = ` +  producto.pcdc_prod_producto_id + `
                                        `, 
                                        {
                                            type: sequelize.QueryTypes.SELECT
                                        });
                                        if(producto.pcdc_cupon_aplicado == false){
                                            if(producto_con_promocion.length > 0){
                                                let regalados = await cantidadAgregar(producto.pcdc_producto_cantidad, producto_con_promocion[0].promdes_tipo_descuento_id);
                                                let total = await producto.pcdc_producto_cantidad - regalados;
                                                producto_carrito.update({
                                                        pcdc_producto_cantidad: total,
                                                        pcdc_cantidad_producto_promocion: regalados,
                                                        pcdc_prod_producto_id_promocion: producto.pcdc_prod_producto_id,
                                                        pcdc_precio: mejor_precio[0].min,
                                                        pcdc_prod_producto_id_regalo: (producto_regalo.length > 0) ? producto_regalo[0].promdes_sku_gift : null,
                                                        pcdc_cantidad_producto_regalo: (producto_regalo.length > 0) ? producto.pcdc_producto_cantidad : null,
                                                        pcdc_mejor_descuento: (mejor_descuento.length > 0) ?  mejor_descuento[0].mejor_descuento : 0,
                                                        pcdc_tipo_prmocion_individual: (descuento_porcentaje_or_monto_fijo.length > 0) ? descuento_porcentaje_or_monto_fijo[0].promdes_tipo_descuento_id : null,
                                                        pcdc_descuento_promocion: (descuento_porcentaje_or_monto_fijo.length > 0) ? descuento_porcentaje_or_monto_fijo[0].promdes_descuento_exacto : null
    
                                                });
                                            }else{
                                                producto_carrito.update({
                                                    pcdc_precio: mejor_precio[0].min,
                                                    pcdc_prod_producto_id_regalo: (producto_regalo.length > 0) ? producto_regalo[0].promdes_sku_gift : null,
                                                    pcdc_cantidad_producto_regalo: (producto_regalo.length > 0) ? producto.pcdc_producto_cantidad : null,
                                                    pcdc_mejor_descuento: (mejor_descuento.length > 0) ?  mejor_descuento[0].mejor_descuento : 0,
                                                    pcdc_tipo_prmocion_individual: (descuento_porcentaje_or_monto_fijo.length > 0) ? descuento_porcentaje_or_monto_fijo[0].promdes_tipo_descuento_id : null,
                                                    pcdc_descuento_promocion: (descuento_porcentaje_or_monto_fijo.length > 0) ? descuento_porcentaje_or_monto_fijo[0].promdes_descuento_exacto : null
                                                });
                                            }
                                        }
                                        ///////////////////////////////////////////////////// RETURN
                                        if((carrito_de_compra.dataValues.productos_carrito_de_compras.length -1) == indexProducto){
                                            
                                            //REGRESAMO CARRITO DETALLE
                                            const carrito_de_compra =  await models.CarritoDeCompra.findOne({
                                                where: {
                                                    cdc_carrito_de_compra_id: carrito_id
                                                }
                                            });
        
                                            const productos_carrito_de_compras = await models.ProductoCarritoDeCompra.findAll({
                                                where: {
                                                    pcdc_carrito_de_compra_id: carrito_de_compra.dataValues.cdc_carrito_de_compra_id
                                                },
                                                order: [
                                                    ['pcdc_prod_producto_id', 'ASC']
                                                ]
                                            });

                                            productos_carrito_de_compras.forEach(async function(producto, indexProducto){
                                                const almacenes_fisicos = await models.Almacenes.findAll({
                                                    where: {
                                                        alm_cmm_estatus_id: statusControllers.ESTATUS_ALMACENES.ACTIVA,
                                                        alm_tipo_almacen: statusControllers.TIPO_ALMACEN.FISICO
                                                    }
                                                });
                                                const producto_carrito = await models.ProductoCarritoDeCompra.findOne({
                                                    where:{
                                                        pcdc_carrito_de_compra_id: producto.dataValues.pcdc_carrito_de_compra_id,
                                                        pcdc_prod_producto_id: producto.dataValues.pcdc_prod_producto_id
                                                    }
                                                });
                                                almacenes_fisicos.forEach(async function(almacenFisico, indexAlmacenFisico){
                                                    const almacen_origen = await sequelize.query(`
                                                    select 
                                                        distinct(total_stock.alm_almacen_id) as almacen,
                                                        total_stock.fisico as fisico,
                                                        case 
                                                            when count(distinct(total_stock.fisico)) = 1  then
                                                                sum(total_stock.sp_cantidad)
                                                            when count(distinct(total_stock.fisico))  > 1 then
                                                                total_stock.sp_cantidad
                                                        end as cantidad,
                                                        total_stock.prod_disponible_backorder
                                                    from( 
                                                        ---Almacen Fisico general tercer
                                                        select
                                                            distinct (a.alm_almacen_id),
                                                            a.alm_almacen_id as fisico,
                                                            sp.sp_cantidad,
                                                            p.prod_disponible_backorder
                                                        from almacenes a 
                                                        left join almacenes_logistica al  on al.almlog_almacen_codigo = a."alm_codigoAlmacen" 
                                                        left join stocks_productos sp ON sp.sp_almacen_id = a.alm_almacen_id 
                                                        left join productos p  on p.prod_producto_id  = sp.sp_prod_producto_id 
                                                        where sp.sp_almacen_id = ` + almacenFisico.dataValues.alm_almacen_id + ` and  a.alm_cmm_estatus_id = ` + statusControllers.ESTATUS_ALMACENES.ACTIVA + ` and sp.sp_prod_producto_id  = ` + producto.dataValues.pcdc_prod_producto_id + `
                                                        union 
                                                        ---Almacen virtual asignado a socio
                                                        select
                                                            distinct(a.alm_almacen_id),
                                                            a2.alm_almacen_id as fisico,
                                                            sp.sp_cantidad,
                                                            p2.prod_disponible_backorder
                                                        from almacenes a 
                                                        left join almacenes a2 on a2.alm_almacen_id = a.alm_fisico
                                                        left join stocks_productos sp on sp.sp_almacen_id  = a.alm_almacen_id 
                                                        left join productos p2 on p2.prod_producto_id  = sp.sp_prod_producto_id 
                                                        left join almacenes_logistica al on al.almlog_almacen_codigo = a2."alm_codigoAlmacen" 
                                                        where a.alm_almacen_id  = ` + almacen_virtual + ` and a.alm_cmm_estatus_id = ` + statusControllers.ESTATUS_ALMACENES.ACTIVA + ` and sp.sp_prod_producto_id  = ` + producto.dataValues.pcdc_prod_producto_id + `
                                                    )total_stock
                                                    group by total_stock.fisico, total_stock.sp_cantidad, total_stock.alm_almacen_id, total_stock.prod_disponible_backorder;
                                                    `, 
                                                    {
                                                        type: sequelize.QueryTypes.SELECT
                                                    });
                                                    console.log('RESULTADO CONSULTA ', almacen_origen, almacen_origen[0].cantidad, producto_carrito.dataValues.pcdc_producto_cantidad)
                                                    if(Number(almacen_origen[0].cantidad) > producto_carrito.dataValues.pcdc_producto_cantidad && (producto.dataValues.pcdc_validado == false)){
                                                        await producto_carrito.update({
                                                            pcdc_almacen_surtido: almacen_origen[0].fisico,
                                                            pcdc_validado: true
                                                        });
                                                    }if((Number(almacen_origen[0].cantidad) < producto_carrito.dataValues.pcdc_producto_cantidad) && (producto.dataValues.pcdc_validado == false)){
                                                        if((almacen_origen[0].prod_disponible_backorder) && (producto.dataValues.pcdc_validado == false)){
                                                            await producto_carrito.update({
                                                                pcdc_back_order: true,
                                                                pcdc_validado: true
                                                            });
                                                        }else if(producto.dataValues.pcdc_validado == false){
                                                            await producto_carrito.update({
                                                                pcdc_no_disponible_para_compra: true,
                                                                pcdc_producto_cantidad: 0,
                                                                pcdc_validado: true
                                                            });
                                                        }
                                                    }
                                                    if((almacenes_fisicos.length -1) == indexAlmacenFisico){
                                                        if((productos_carrito_de_compras.length -1) == indexProducto){
                                                            
                                                            const productos_carrito_de_compras = await models.ProductoCarritoDeCompra.findAll({
                                                                where: {
                                                                    pcdc_carrito_de_compra_id: carrito_de_compra.dataValues.cdc_carrito_de_compra_id
                                                                },
                                                                order: [
                                                                    ['pcdc_prod_producto_id', 'ASC']
                                                                ],
                                                                attributes: {
                                                                    exclude: ['pcdc_validado']
                                                                },
                                                                include: [
                                                                    {
                                                                        model: models.Producto,
                                                                        attributes: {
                                                                            exclude: [
                                                                                'prod_usu_usuario_creado_id',
                                                                                'createdAt',
                                                                                'prod_usu_usuario_modificado_id',
                                                                                'updatedAt',
                                                                                'prod_descripcion_corta',
                                                                                'prod_unidad_medida_venta',
                                                                                'prod_altura',
                                                                                'prod_ancho',
                                                                                'prod_longitud',
                                                                                'prod_peso',
                                                                                'prod_volumen',
                                                                                'prod_total_stock',
                                                                                'prod_proveedor_id',
                                                                                'prod_meta_titulo',
                                                                                'prod_meta_descripcion',
                                                                                'prod_is_kit',
                                                                                'prod_viñetas',
                                                                                'prod_calificacion_promedio',
                                                                                'prod_productos_coleccion_relacionados_id',
                                                                                'prod_productos_coleccion_accesorios_id',
                                                                                'prod_video_url'
                                                                            ]
                                                                        },
                                                                        include: [
                                                                            {
                                                                                model: models.ImagenProducto,
                                                                                attributes: {
                                                                                    exclude: [
                                                                                        'imgprod_imagen_producto_id',
                                                                                        'imgprod_usu_usuario_creador_id',
                                                                                        'createdAt',
                                                                                        'updatedAt'
                                                                                    ]
                                                                                }
                                                                            }
                                                                        ]
                                                                    }
                                                                ]
                                                            });
                                                            res.status(200).send({
                                                                message: 'Producto agregado correctamente.',
                                                                carrito_de_compra,
                                                                productos_carrito_de_compras,
                                                                jsonToProject,
                                                                porcentajeDeAprobacion
                                                            });  
                                                        }
                                                    }
                                                });                                                        
                                            });    
                                        }
                                    });
                                }
                            });
                        }else{
                            const carrito_de_compra =  await models.CarritoDeCompra.findOne({
                                where: {
                                    cdc_carrito_de_compra_id: carrito_id
                                },
                                include: [
                                    {
                                        model: models.ProductoCarritoDeCompra,
                                        attributes: {
                                            exclude: [
                                                'createdAt',
                                                'updatedAt',
                                            ]
                                        }
                                    }
                                ]
                            });
                            carrito_de_compra.dataValues.productos_carrito_de_compras.forEach(async function(producto, indexProducto){
                                const producto_carrito = await models.ProductoCarritoDeCompra.findOne({
                                    where: {
                                        pcdc_carrito_de_compra_id: producto.pcdc_carrito_de_compra_id,
                                        pcdc_prod_producto_id: producto.pcdc_prod_producto_id
                                    }
                                });
                                
                                //Validamos promociones activas
                                const producto_con_promocion =  await sequelize.query(`         
                                select 
                                    *
                                from(
                                    select
                                        pd.promdes_promocion_descuento_id,
                                        pd.promdes_fecha_inicio_validez, 
                                        pd.promdes_fecha_finalizacion_validez,
                                        pp.prodprom_prod_producto_id,
                                        pd.promdes_tipo_descuento_id 
                                    from promociones_descuentos pd
                                    left join productos_promociones pp  on pp.prodprom_promdes_promocion_descuento_id  = pd.promdes_promocion_descuento_id 
                                    where 
                                        (promdes_tipo_descuento_id = ` + statusControllers.TIPO_PROMOCION['2 X 1'] + ` or promdes_tipo_descuento_id  = ` + statusControllers.TIPO_PROMOCION['3 X 2'] + `)
                                        and
                                            promdes_estatus_id  = ` + statusControllers.ESTATUS_PROMOCION.ACTIVA + `
                                        and
                                        (current_date between  promdes_fecha_inicio_validez and promdes_fecha_finalizacion_validez)
                                        and 
                                            promdes_cupon_descuento  is null
                                )productos
                                where productos.prodprom_prod_producto_id = ` + producto.pcdc_prod_producto_id + `;`, 
                                { type: sequelize.QueryTypes.SELECT });
                                const mejor_precio =  await sequelize.query(`         
                                select
                                    case 
                                        when min(mejor_precio.prod_precio) <= 0 then max(mejor_precio.prod_precio) 
                                        else
                                            min(mejor_precio.prod_precio) 
                                    end as min
                                from (
                                    select 
                                        prod_precio
                                    from productos p 
                                    where prod_producto_id  = ` + producto.pcdc_prod_producto_id + `
                                    union 
                                    select
                                        pldp.pl_precio_producto 
                                    from productos_lista_de_precio pldp 
                                    where pldp.pl_prod_producto_id = ` + producto.pcdc_prod_producto_id + ` and pldp.pl_listp_lista_de_precio_id  = ` + listaPrecio + `
                                )mejor_precio;`, 
                                { type: sequelize.QueryTypes.SELECT });
                                const producto_regalo = await sequelize.query(`
                                select 
                                *
                                from(
                                    select
                                        pd.promdes_sku_gift,
                                        pd.promdes_promocion_descuento_id,
                                        pd.promdes_fecha_inicio_validez, 
                                        pd.promdes_fecha_finalizacion_validez,
                                        pp.prodprom_prod_producto_id,
                                        pd.promdes_tipo_descuento_id 
                                    from promociones_descuentos pd
                                    left join productos_promociones pp  on pp.prodprom_promdes_promocion_descuento_id  = pd.promdes_promocion_descuento_id 
                                    where 
                                        (promdes_tipo_descuento_id = ` + statusControllers.TIPO_PROMOCION['Regalo'] + `)
                                        and
                                            promdes_estatus_id  = `+ statusControllers.ESTATUS_PROMOCION.ACTIVA +`
                                        and
                                        (current_date between  promdes_fecha_inicio_validez and promdes_fecha_finalizacion_validez)
                                        and 
                                            promdes_cupon_descuento  is null
                                )productos
                                where productos.prodprom_prod_producto_id = ` + producto.pcdc_prod_producto_id + `;
                                `, { type: sequelize.QueryTypes.SELECT} );
                                const mejor_descuento = await sequelize.query(`
                                select
                                    case 
                                        when max(mejor_descuento.descuento) <= 9 then cast(concat(0, max(mejor_descuento.descuento)) as integer)
                                        else max(mejor_descuento.descuento) 
                                    end as mejor_descuento
                                from( 
                                    select 
                                        prod_descuento as descuento
                                    from productos p 
                                    where prod_producto_id  = ` + producto.pcdc_prod_producto_id + `
                                    union
                                    select 
                                        m.mar_descuento as descuento
                                    from productos p2 
                                    left join marcas m ON  m.mar_marca_id  = p2.prod_mar_marca_id  
                                    where p2.prod_producto_id  = ` + producto.pcdc_prod_producto_id + `
                                    union 
                                    select 
                                        case 
                                            when sn.sn_descuento >= ldp.listp_descuento then sn.sn_descuento
                                            when ldp.listp_descuento >= sn.sn_descuento then ldp.listp_descuento
                                        end as descuento
                                    from socios_negocio sn 
                                    left join listas_de_precios ldp on ldp.listp_lista_de_precio_id  = sn.sn_socios_negocio_id 
                                    where sn.sn_socios_negocio_id  = ` + socio + `
                                )mejor_descuento;`, { type: sequelize.QueryTypes.SELECT });
                                const descuento_porcentaje_or_monto_fijo = await sequelize.query(`
                                select 
                                    *
                                from(
                                    select
                                        pd.promdes_tipo_descuento_id,
                                        pd.promdes_promocion_descuento_id,
                                        pd.promdes_descuento_exacto,
                                        pd.promdes_fecha_inicio_validez, 
                                        pd.promdes_fecha_finalizacion_validez,
                                        pp.prodprom_prod_producto_id,
                                        pd.promdes_tipo_descuento_id 
                                    from promociones_descuentos pd
                                    left join productos_promociones pp  on pp.prodprom_promdes_promocion_descuento_id  = pd.promdes_promocion_descuento_id 
                                    where 
                                        (promdes_tipo_descuento_id = ` + statusControllers.TIPO_PROMOCION.Porcentaje + ` or promdes_tipo_descuento_id  = ` + statusControllers.TIPO_PROMOCION['Monto fijo'] + `)
                                        and
                                            promdes_estatus_id  = ` + statusControllers.ESTATUS_PROMOCION.ACTIVA + `
                                        and
                                        (current_date between  promdes_fecha_inicio_validez and promdes_fecha_finalizacion_validez)
                                        and 
                                        promdes_carrito_articulo is true
                                        and 
                                            promdes_cupon_descuento  is null
                                )productos
                                where productos.prodprom_prod_producto_id = ` +  producto.pcdc_prod_producto_id + `
                                `, 
                                {
                                    type: sequelize.QueryTypes.SELECT
                                })
                                if(producto.pcdc_cupon_aplicado == false){
                                    if(producto_con_promocion.length > 0){
                                        let regalados = await cantidadAgregar(producto.pcdc_producto_cantidad, producto_con_promocion[0].promdes_tipo_descuento_id);
                                        let total = await producto.pcdc_producto_cantidad - regalados;
                                        producto_carrito.update({
                                                pcdc_producto_cantidad: total,
                                                pcdc_prod_producto_id_promocion: producto.pcdc_prod_producto_id,
                                                pcdc_cantidad_producto_promocion: regalados,
                                                pcdc_precio: mejor_precio[0].min,
                                                pcdc_prod_producto_id_regalo: (producto_regalo.length > 0) ? producto_regalo[0].promdes_sku_gift : null,
                                                pcdc_cantidad_producto_regalo: (producto_regalo.length > 0) ? producto.pcdc_producto_cantidad : null,
                                                pcdc_mejor_descuento: (mejor_descuento.length > 0) ?  mejor_descuento[0].mejor_descuento : 0,
                                                pcdc_tipo_prmocion_individual: (descuento_porcentaje_or_monto_fijo.length > 0) ? descuento_porcentaje_or_monto_fijo[0].promdes_tipo_descuento_id : null,
                                                pcdc_descuento_promocion: (descuento_porcentaje_or_monto_fijo.length > 0) ? descuento_porcentaje_or_monto_fijo[0].promdes_descuento_exacto : null
    
                                        });
                                    }else{
                                        producto_carrito.update({
                                            pcdc_precio: mejor_precio[0].min,
                                            pcdc_prod_producto_id_regalo: (producto_regalo.length > 0) ? producto_regalo[0].promdes_sku_gift : null,
                                            pcdc_cantidad_producto_regalo: (producto_regalo.length > 0) ? producto.pcdc_producto_cantidad : null,
                                            pcdc_mejor_descuento: (mejor_descuento.length > 0) ?  mejor_descuento[0].mejor_descuento : 0,
                                            pcdc_tipo_prmocion_individual: (descuento_porcentaje_or_monto_fijo.length > 0) ? descuento_porcentaje_or_monto_fijo[0].promdes_tipo_descuento_id : null,
                                            pcdc_descuento_promocion: (descuento_porcentaje_or_monto_fijo.length > 0) ? descuento_porcentaje_or_monto_fijo[0].promdes_descuento_exacto : null
                                        });
                                    }
                                }    
                                //////////////////////////////////////////////////////////// RETURN 
                                if((carrito_de_compra.dataValues.productos_carrito_de_compras.length -1) == indexProducto){
                                    //REGRESAMO CARRITO DETALLE
                                    const carrito_de_compra =  await models.CarritoDeCompra.findOne({
                                        where: {
                                            cdc_carrito_de_compra_id: carrito_id
                                        }
                                    });

                                    const productos_carrito_de_compras = await models.ProductoCarritoDeCompra.findAll({
                                        where: {
                                            pcdc_carrito_de_compra_id: carrito_de_compra.dataValues.cdc_carrito_de_compra_id
                                        },
                                        order: [
                                            ['pcdc_prod_producto_id', 'ASC']
                                        ]
                                    });

                                    productos_carrito_de_compras.forEach(async function(producto, indexProducto){
                                        const almacenes_fisicos = await models.Almacenes.findAll({
                                            where: {
                                                alm_cmm_estatus_id: statusControllers.ESTATUS_ALMACENES.ACTIVA,
                                                alm_tipo_almacen: statusControllers.TIPO_ALMACEN.FISICO
                                            }
                                        });
                                        const producto_carrito = await models.ProductoCarritoDeCompra.findOne({
                                            where:{
                                                pcdc_carrito_de_compra_id: producto.dataValues.pcdc_carrito_de_compra_id,
                                                pcdc_prod_producto_id: producto.dataValues.pcdc_prod_producto_id
                                            }
                                        });
                                        almacenes_fisicos.forEach(async function(almacenFisico, indexAlmacenFisico){
                                            const almacen_origen = await sequelize.query(`
                                            select 
                                                distinct(total_stock.alm_almacen_id) as almacen,
                                                total_stock.fisico as fisico,
                                                case 
                                                    when count(distinct(total_stock.fisico)) = 1  then
                                                        sum(total_stock.sp_cantidad)
                                                    when count(distinct(total_stock.fisico))  > 1 then
                                                        total_stock.sp_cantidad
                                                end as cantidad,
                                                total_stock.prod_disponible_backorder
                                            from( 
                                                ---Almacen Fisico general tercer
                                                select
                                                    distinct (a.alm_almacen_id),
                                                    a.alm_almacen_id as fisico,
                                                    sp.sp_cantidad,
                                                    p.prod_disponible_backorder
                                                from almacenes a 
                                                left join almacenes_logistica al  on al.almlog_almacen_codigo = a."alm_codigoAlmacen" 
                                                left join stocks_productos sp ON sp.sp_almacen_id = a.alm_almacen_id 
                                                left join productos p  on p.prod_producto_id  = sp.sp_prod_producto_id 
                                                where sp.sp_almacen_id = ` + almacenFisico.dataValues.alm_almacen_id + ` and  a.alm_cmm_estatus_id = ` + statusControllers.ESTATUS_ALMACENES.ACTIVA + ` and sp.sp_prod_producto_id  = ` + producto.dataValues.pcdc_prod_producto_id + `
                                                union 
                                                ---Almacen virtual asignado a socio
                                                select
                                                    distinct(a.alm_almacen_id),
                                                    a2.alm_almacen_id as fisico,
                                                    sp.sp_cantidad,
                                                    p2.prod_disponible_backorder
                                                from almacenes a 
                                                left join almacenes a2 on a2.alm_almacen_id = a.alm_fisico
                                                left join stocks_productos sp on sp.sp_almacen_id  = a.alm_almacen_id 
                                                left join productos p2 on p2.prod_producto_id  = sp.sp_prod_producto_id 
                                                left join almacenes_logistica al on al.almlog_almacen_codigo = a2."alm_codigoAlmacen" 
                                                where a.alm_almacen_id  = ` + almacen_virtual + ` and a.alm_cmm_estatus_id = ` + statusControllers.ESTATUS_ALMACENES.ACTIVA + ` and sp.sp_prod_producto_id  = ` + producto.dataValues.pcdc_prod_producto_id + `
                                            )total_stock
                                            group by total_stock.fisico, total_stock.sp_cantidad, total_stock.alm_almacen_id, total_stock.prod_disponible_backorder;
                                            `, 
                                            {
                                                type: sequelize.QueryTypes.SELECT
                                            });
                                            console.log('RESULTADO CONSULTA ', almacen_origen, almacen_origen[0].cantidad, producto_carrito.dataValues.pcdc_producto_cantidad)
                                            if(Number(almacen_origen[0].cantidad) > producto_carrito.dataValues.pcdc_producto_cantidad && (producto.dataValues.pcdc_validado == false)){
                                                await producto_carrito.update({
                                                    pcdc_almacen_surtido: almacen_origen[0].fisico,
                                                    pcdc_validado: true
                                                });
                                            }if((Number(almacen_origen[0].cantidad) < producto_carrito.dataValues.pcdc_producto_cantidad) && (producto.dataValues.pcdc_validado == false)){
                                                if((almacen_origen[0].prod_disponible_backorder) && (producto.dataValues.pcdc_validado == false)){
                                                    await producto_carrito.update({
                                                        pcdc_back_order: true,
                                                        pcdc_validado: true
                                                    });
                                                }else if(producto.dataValues.pcdc_validado == false){
                                                    await producto_carrito.update({
                                                        pcdc_no_disponible_para_compra: true,
                                                        pcdc_producto_cantidad: 0,
                                                        pcdc_validado: true
                                                    });
                                                }
                                            }
                                            if((almacenes_fisicos.length -1) == indexAlmacenFisico){
                                                if((productos_carrito_de_compras.length -1) == indexProducto){
                                                    
                                                    const productos_carrito_de_compras = await models.ProductoCarritoDeCompra.findAll({
                                                        where: {
                                                            pcdc_carrito_de_compra_id: carrito_de_compra.dataValues.cdc_carrito_de_compra_id
                                                        },
                                                        order: [
                                                            ['pcdc_prod_producto_id', 'ASC']
                                                        ],
                                                        attributes: {
                                                            exclude: ['pcdc_validado']
                                                        },
                                                        include: [
                                                            {
                                                                model: models.Producto,
                                                                attributes: {
                                                                    exclude: [
                                                                        'prod_usu_usuario_creado_id',
                                                                        'createdAt',
                                                                        'prod_usu_usuario_modificado_id',
                                                                        'updatedAt',
                                                                        'prod_descripcion_corta',
                                                                        'prod_unidad_medida_venta',
                                                                        'prod_altura',
                                                                        'prod_ancho',
                                                                        'prod_longitud',
                                                                        'prod_peso',
                                                                        'prod_volumen',
                                                                        'prod_total_stock',
                                                                        'prod_proveedor_id',
                                                                        'prod_meta_titulo',
                                                                        'prod_meta_descripcion',
                                                                        'prod_is_kit',
                                                                        'prod_viñetas',
                                                                        'prod_calificacion_promedio',
                                                                        'prod_productos_coleccion_relacionados_id',
                                                                        'prod_productos_coleccion_accesorios_id',
                                                                        'prod_video_url'
                                                                    ]
                                                                },
                                                                include: [
                                                                    {
                                                                        model: models.ImagenProducto,
                                                                        attributes: {
                                                                            exclude: [
                                                                                'imgprod_imagen_producto_id',
                                                                                'imgprod_usu_usuario_creador_id',
                                                                                'createdAt',
                                                                                'updatedAt'
                                                                            ]
                                                                        }
                                                                    }
                                                                ]
                                                            }
                                                        ]
                                                    });
                                                    res.status(200).send({
                                                        message: 'Producto agregado correctamente.',
                                                        carrito_de_compra,
                                                        productos_carrito_de_compras,
                                                        jsonToProject,
                                                        porcentajeDeAprobacion
                                                    });  
                                                }
                                            }
                                        });                                                        
                                    });                           
                                }
                            });
                        }
                    }
                }
            }else{
                res.status(300).send({
                    message: 'Error, al crear carrito. (No se puede crear un carrito vacío)'
                })
            }
        }catch(e){
            res.status(500).send({
                message: 'Error, al crear el carrito',
                e
            });
            next(e);
        }
    },
    //Agregar producto a carrito. (Restructuración)
    addProductCarShop: async(req, res, next) =>{
        try{
            let carrito_de_compra = await models.CarritoDeCompra.findOne({
                where: {
                    cdc_carrito_de_compra_id: req.body.pcdc_carrito_de_compra_id
                },
                include: [
                    {
                        model: models.ProductoCarritoDeCompra,
                        attributes: {
                            exclude: [
                                'pcdc_producto_carrito_id',
                                'createdAt',
                                'updatedAt',
                            ]
                        },
                        include: [
                            {
                                model: models.Producto
                            }
                        ]
                    }
                ]
            });
            
            const listaPrecio = !!carrito_de_compra.cdc_lista_precio ? carrito_de_compra.cdc_lista_precio : 0;
            const socio = !!carrito_de_compra.cdc_sn_socio_de_negocio_id ? carrito_de_compra.cdc_sn_socio_de_negocio_id : 0;
            const carrito_id = !!carrito_de_compra.cdc_carrito_de_compra_id ? carrito_de_compra.cdc_carrito_de_compra_id : 0;
            let socio_negocio = await models.SociosNegocio.findOne({
                where: {
                    sn_socios_negocio_id: socio
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
            let almacen_virtual  = !!socio_negocio ? socio_negocio.dataValues.sn_almacen_asignado : 0;
            if(!!carrito_de_compra){
                const delete_product = await models.ProductoCarritoDeCompra.destroy({
                    where: {
                        pcdc_carrito_de_compra_id : carrito_id,
                        pcdc_prod_producto_id : req.body.pcdc_prod_producto_id
                    }
                });
                //Validamos promociones activas
                const producto_con_promocion =  await sequelize.query(`         
                select 
                    *
                from(
                    select
                        pd.promdes_promocion_descuento_id,
                        pd.promdes_fecha_inicio_validez, 
                        pd.promdes_fecha_finalizacion_validez,
                        pp.prodprom_prod_producto_id,
                        pd.promdes_tipo_descuento_id 
                    from promociones_descuentos pd
                    left join productos_promociones pp  on pp.prodprom_promdes_promocion_descuento_id  = pd.promdes_promocion_descuento_id 
                    where 
                        (promdes_tipo_descuento_id = ` + statusControllers.TIPO_PROMOCION['2 X 1'] + ` or promdes_tipo_descuento_id  = ` + statusControllers.TIPO_PROMOCION['3 X 2'] + `)
                        and
                            promdes_estatus_id  = ` + statusControllers.ESTATUS_PROMOCION.ACTIVA + `
                        and
                        (current_date between  promdes_fecha_inicio_validez and promdes_fecha_finalizacion_validez)
                        and 
                            promdes_cupon_descuento  is null
                )productos
                where productos.prodprom_prod_producto_id = ` + req.body.pcdc_prod_producto_id + `;`, 
                { type: sequelize.QueryTypes.SELECT });
                const mejor_precio =  await sequelize.query(`         
                select
                    case 
                        when min(mejor_precio.prod_precio) <= 0 then max(mejor_precio.prod_precio) 
                        else
                            min(mejor_precio.prod_precio) 
                    end as min
                from (
                    select 
                        prod_precio
                    from productos p 
                    where prod_producto_id  = ` + req.body.pcdc_prod_producto_id + `
                    union 
                    select
                        pldp.pl_precio_producto 
                    from productos_lista_de_precio pldp 
                    where pldp.pl_prod_producto_id = ` + req.body.pcdc_prod_producto_id + ` and pldp.pl_listp_lista_de_precio_id  = ` + listaPrecio + `
                )mejor_precio;`, 
                { type: sequelize.QueryTypes.SELECT });
                const producto_regalo = await sequelize.query(`
                select 
                *
                from(
                    select
                        pd.promdes_sku_gift,
                        pd.promdes_promocion_descuento_id,
                        pd.promdes_fecha_inicio_validez, 
                        pd.promdes_fecha_finalizacion_validez,
                        pp.prodprom_prod_producto_id,
                        pd.promdes_tipo_descuento_id 
                    from promociones_descuentos pd
                    left join productos_promociones pp  on pp.prodprom_promdes_promocion_descuento_id  = pd.promdes_promocion_descuento_id 
                    where 
                        (promdes_tipo_descuento_id = ` + statusControllers.TIPO_PROMOCION['Regalo'] + `)
                        and
                            promdes_estatus_id  = `+ statusControllers.ESTATUS_PROMOCION.ACTIVA +`
                        and
                        (current_date between  promdes_fecha_inicio_validez and promdes_fecha_finalizacion_validez)
                        and 
                            promdes_cupon_descuento  is null
                )productos
                where productos.prodprom_prod_producto_id = ` + req.body.pcdc_prod_producto_id + `;
                `, { type: sequelize.QueryTypes.SELECT} );
                const mejor_descuento = await sequelize.query(`
                select
                    case 
                        when max(mejor_descuento.descuento) <= 9 then cast(concat(0, max(mejor_descuento.descuento)) as integer)
                        else max(mejor_descuento.descuento) 
                    end as mejor_descuento
                from( 
                    select 
                        prod_descuento as descuento
                    from productos p 
                    where prod_producto_id  = ` + req.body.pcdc_prod_producto_id + `
                    union
                    select 
                        m.mar_descuento as descuento
                    from productos p2 
                    left join marcas m ON  m.mar_marca_id  = p2.prod_mar_marca_id  
                    where p2.prod_producto_id  = ` + req.body.pcdc_prod_producto_id + `
                    union 
                    select 
                        case 
                            when sn.sn_descuento >= ldp.listp_descuento then sn.sn_descuento
                            when ldp.listp_descuento >= sn.sn_descuento then ldp.listp_descuento
                        end as descuento
                    from socios_negocio sn 
                    left join listas_de_precios ldp on ldp.listp_lista_de_precio_id  = sn.sn_socios_negocio_id 
                    where sn.sn_socios_negocio_id  = ` + socio + `
                )mejor_descuento;`, { type: sequelize.QueryTypes.SELECT });
                const descuento_porcentaje_or_monto_fijo = await sequelize.query(`
                select 
                    *
                from(
                    select
                        pd.promdes_tipo_descuento_id,
                        pd.promdes_promocion_descuento_id,
                        pd.promdes_descuento_exacto,
                        pd.promdes_fecha_inicio_validez, 
                        pd.promdes_fecha_finalizacion_validez,
                        pp.prodprom_prod_producto_id,
                        pd.promdes_tipo_descuento_id 
                    from promociones_descuentos pd
                    left join productos_promociones pp  on pp.prodprom_promdes_promocion_descuento_id  = pd.promdes_promocion_descuento_id 
                    where 
                        (promdes_tipo_descuento_id = ` + statusControllers.TIPO_PROMOCION.Porcentaje + ` or promdes_tipo_descuento_id  = ` + statusControllers.TIPO_PROMOCION['Monto fijo'] + `)
                        and
                            promdes_estatus_id  = ` + statusControllers.ESTATUS_PROMOCION.ACTIVA + `
                        and
                        (current_date between  promdes_fecha_inicio_validez and promdes_fecha_finalizacion_validez)
                        and 
                        promdes_carrito_articulo is true
                        and 
                            promdes_cupon_descuento  is null
                )productos
                where productos.prodprom_prod_producto_id = ` +  req.body.pcdc_prod_producto_id + `
                `, 
                {
                    type: sequelize.QueryTypes.SELECT
                })
                if(producto_con_promocion.length > 0){
                    let regalados = await cantidadAgregar(req.body.pcdc_producto_cantidad, producto_con_promocion[0].promdes_tipo_descuento_id);
                    let total = await req.body.pcdc_producto_cantidad - regalados;
                    const product_add = await models.ProductoCarritoDeCompra.create({
                            pcdc_carrito_de_compra_id: carrito_id,
                            pcdc_prod_producto_id: req.body.pcdc_prod_producto_id,
                            pcdc_producto_cantidad: total,
                            pcdc_prod_producto_id_promocion: req.body.pcdc_prod_producto_id,
                            pcdc_cantidad_producto_promocion: regalados,
                            pcdc_precio: mejor_precio[0].min,
                            pcdc_prod_producto_id_regalo: (producto_regalo.length > 0) ? producto_regalo[0].promdes_sku_gift : null,
                            pcdc_cantidad_producto_regalo: (producto_regalo.length > 0) ? req.body.pcdc_producto_cantidad : null,
                            pcdc_mejor_descuento: (mejor_descuento.length > 0) ?  mejor_descuento[0].mejor_descuento : 0,
                            pcdc_tipo_prmocion_individual: (descuento_porcentaje_or_monto_fijo.length > 0) ? descuento_porcentaje_or_monto_fijo[0].promdes_tipo_descuento_id : null,
                            pcdc_descuento_promocion: (descuento_porcentaje_or_monto_fijo.length > 0) ? descuento_porcentaje_or_monto_fijo[0].promdes_descuento_exacto : null

                    });
                }else{
                    const product_add = await models.ProductoCarritoDeCompra.create({
                        pcdc_carrito_de_compra_id: carrito_id,
                        pcdc_prod_producto_id: req.body.pcdc_prod_producto_id,
                        pcdc_producto_cantidad: req.body.pcdc_producto_cantidad,
                        pcdc_precio: mejor_precio[0].min,
                        pcdc_prod_producto_id_regalo: (producto_regalo.length > 0) ? producto_regalo[0].promdes_sku_gift : null,
                        pcdc_cantidad_producto_regalo: (producto_regalo.length > 0) ? req.body.pcdc_producto_cantidad : null,
                        pcdc_mejor_descuento: (mejor_descuento.length > 0) ?  mejor_descuento[0].mejor_descuento : 0,
                        pcdc_tipo_prmocion_individual: (descuento_porcentaje_or_monto_fijo.length > 0) ? descuento_porcentaje_or_monto_fijo[0].promdes_tipo_descuento_id : null,
                        pcdc_descuento_promocion: (descuento_porcentaje_or_monto_fijo.length > 0) ? descuento_porcentaje_or_monto_fijo[0].promdes_descuento_exacto : null
                    });
                }

                const marcas_con_limitantes = await sequelize.query(`
                select
                    distinct(m.mar_marca_id)
                from productos_carrito_de_compra pcdc 
                left join productos p ON p.prod_producto_id  = pcdc.pcdc_prod_producto_id
                left join marcas m on m.mar_marca_id  = p.prod_mar_marca_id 
                where 
                    pcdc.pcdc_carrito_de_compra_id  = ` + carrito_id + `
                    and
                    m.mar_propiedades_extras is true
                `,
                {
                    type: sequelize.QueryTypes.SELECT    
                });


                const productos_de_proyecto = await sequelize.query(`
                select
                    distinct(pc.pc_prod_producto_id) as producto 
                from cotizaciones_proyectos cp 
                inner join productos_cotizaciones pc on pc.pc_cot_cotizacion_id = cp.cot_cotizacion_id
                where 
                    cp.cot_cmm_estatus_id  = ` + statusControllers.ESTATUS_COTIZACION_PROYECTO.ACTIVO + `
                    and
                    current_date between  current_date and cp.cot_fecha_vencimiento 
                    and 
                    cp.cot_sn_socios_negocio_id  = ` + socio + `;
                `, {
                    type: sequelize.QueryTypes.SELECT
                });
                let idsProyectos = [];
                if(productos_de_proyecto.length > 0){
                    productos_de_proyecto.forEach(async function(proyecto, indexProyecto){
                        idsProyectos.push(proyecto.producto);
                        if((productos_de_proyecto.length -1) == indexProyecto){
                            let to_ids = await idsProyectos.length > 0 ? idsProyectos : 0 ;
                            const productos_de_carrito_total = await sequelize.query(`
                            select
                                count(distinct(pcdc.pcdc_prod_producto_id)) as incluidos
                            from carrito_de_compras cdc 
                            inner join productos_carrito_de_compra pcdc on pcdc.pcdc_carrito_de_compra_id  = cdc.cdc_carrito_de_compra_id 
                            where 
                                cdc.cdc_carrito_de_compra_id  = ` + carrito_id + `
                                and
                                pcdc.pcdc_prod_producto_id  in (` + to_ids + `);            
                            `, {
                                type: sequelize.QueryTypes.SELECT
                            });
    
                            const productos_de_carrito = await sequelize.query(`
                            select
                                count(distinct(pcdc.pcdc_prod_producto_id)) as total
                            from carrito_de_compras cdc 
                            inner join productos_carrito_de_compra pcdc on pcdc.pcdc_carrito_de_compra_id  = cdc.cdc_carrito_de_compra_id 
                            where 
                                cdc.cdc_carrito_de_compra_id  = ` + carrito_id + `;            
                            `, {
                                type: sequelize.QueryTypes.SELECT
                            });
    
                            let porcentajeDeAprobacion = await Number(((Number(productos_de_carrito_total[0].incluidos) / Number(productos_de_carrito[0].total)) * 100).toFixed(2));
                            let jsonToProject = [];
                            if(marcas_con_limitantes.length > 0){
                                marcas_con_limitantes.forEach(async function(marca, indexMarca){
                                    const validacionMarca = await sequelize.query(`
                                    select
                                        sum(sumatotal.precio_con_descuento) as total,
                                        sumatotal.marca,
                                        m.mar_importe,
                                        case 
                                            when m.mar_importe  < sum(sumatotal.precio_con_descuento) then true
                                            when m.mar_importe  > sum(sumatotal.precio_con_descuento) then false
                                        end as cumple
                                    from(
                                        select
                                            descuento.pcdc_producto_cantidad,
                                            descuento.prod_mar_marca_id as marca,
                                            case 
                                                when descuento.pcdc_mejor_descuento >= 10 then  descuento.pcdc_producto_cantidad * (descuento.pcdc_precio -  (descuento.pcdc_precio * cast(concat('0.' || descuento.pcdc_mejor_descuento) as float)))
                                                when descuento.pcdc_mejor_descuento <= 9 then   descuento.pcdc_producto_cantidad * (descuento.pcdc_precio -  (descuento.pcdc_precio * cast(concat('0.0' || descuento.pcdc_mejor_descuento) as float)))
                                            end as precio_con_descuento,
                                            *
                                        from (
                                            select 
                                                *
                                            from productos_carrito_de_compra pcdc 
                                            left join productos p  on p.prod_producto_id  = pcdc.pcdc_prod_producto_id
                                            where 
                                                pcdc.pcdc_carrito_de_compra_id  = ` + carrito_id + `
                                                and 
                                                p.prod_mar_marca_id  = ` + marca.mar_marca_id + `
                                        )descuento
                                    )sumatotal
                                    left join marcas m on m.mar_marca_id  = sumatotal.marca
                                    group  by sumatotal.marca, m.mar_importe;
                                    `, {
                                        type: sequelize.QueryTypes.SELECT
                                    });
                                    jsonToProject.push(validacionMarca[0]);
                                    if((marcas_con_limitantes.length -1) == indexMarca){
                                        const carrito_de_compra =  await models.CarritoDeCompra.findOne({
                                            where: {
                                                cdc_carrito_de_compra_id: carrito_id
                                            },
                                            include: [
                                                {
                                                    model: models.ProductoCarritoDeCompra,
                                                    attributes: {
                                                        exclude: [
                                                            'pcdc_producto_carrito_id',
                                                            'createdAt',
                                                            'updatedAt',
                                                        ]
                                                    },
                                                    include: [
                                                        {
                                                            model: models.Producto,
                                                            include: [
                                                                {
                                                                    model: models.ImagenProducto
                                                                }
                                                            ]
                                                        }
                                                    ]
                                                }
                                            ]
                                        });
                                        carrito_de_compra.dataValues.productos_carrito_de_compras.forEach(async function(producto, indexProducto){
                                            const producto_carrito = await models.ProductoCarritoDeCompra.findOne({
                                                where: {
                                                    pcdc_carrito_de_compra_id: producto.pcdc_carrito_de_compra_id,
                                                    pcdc_prod_producto_id: producto.pcdc_prod_producto_id
                                                }
                                            });
                                            
                                            //Validamos promociones activas
                                            const producto_con_promocion =  await sequelize.query(`         
                                            select 
                                                *
                                            from(
                                                select
                                                    pd.promdes_promocion_descuento_id,
                                                    pd.promdes_fecha_inicio_validez, 
                                                    pd.promdes_fecha_finalizacion_validez,
                                                    pp.prodprom_prod_producto_id,
                                                    pd.promdes_tipo_descuento_id 
                                                from promociones_descuentos pd
                                                left join productos_promociones pp  on pp.prodprom_promdes_promocion_descuento_id  = pd.promdes_promocion_descuento_id 
                                                where 
                                                    (promdes_tipo_descuento_id = ` + statusControllers.TIPO_PROMOCION['2 X 1'] + ` or promdes_tipo_descuento_id  = ` + statusControllers.TIPO_PROMOCION['3 X 2'] + `)
                                                    and
                                                        promdes_estatus_id  = ` + statusControllers.ESTATUS_PROMOCION.ACTIVA + `
                                                    and
                                                    (current_date between  promdes_fecha_inicio_validez and promdes_fecha_finalizacion_validez)
                                                    and 
                                                        promdes_cupon_descuento  is null
                                            )productos
                                            where productos.prodprom_prod_producto_id = ` + producto.pcdc_prod_producto_id + `;`, 
                                            { type: sequelize.QueryTypes.SELECT });
                                            const mejor_precio =  await sequelize.query(`         
                                            select
                                                case 
                                                    when min(mejor_precio.prod_precio) <= 0 then max(mejor_precio.prod_precio) 
                                                    else
                                                        min(mejor_precio.prod_precio) 
                                                end as min
                                            from (
                                                select 
                                                    prod_precio
                                                from productos p 
                                                where prod_producto_id  = ` + producto.pcdc_prod_producto_id + `
                                                union 
                                                select
                                                    pldp.pl_precio_producto 
                                                from productos_lista_de_precio pldp 
                                                where pldp.pl_prod_producto_id = ` + producto.pcdc_prod_producto_id + ` and pldp.pl_listp_lista_de_precio_id  = ` + listaPrecio + `
                                            )mejor_precio;`, 
                                            { type: sequelize.QueryTypes.SELECT });
                                            const producto_regalo = await sequelize.query(`
                                            select 
                                            *
                                            from(
                                                select
                                                    pd.promdes_sku_gift,
                                                    pd.promdes_promocion_descuento_id,
                                                    pd.promdes_fecha_inicio_validez, 
                                                    pd.promdes_fecha_finalizacion_validez,
                                                    pp.prodprom_prod_producto_id,
                                                    pd.promdes_tipo_descuento_id 
                                                from promociones_descuentos pd
                                                left join productos_promociones pp  on pp.prodprom_promdes_promocion_descuento_id  = pd.promdes_promocion_descuento_id 
                                                where 
                                                    (promdes_tipo_descuento_id = ` + statusControllers.TIPO_PROMOCION['Regalo'] + `)
                                                    and
                                                        promdes_estatus_id  = `+ statusControllers.ESTATUS_PROMOCION.ACTIVA +`
                                                    and
                                                    (current_date between  promdes_fecha_inicio_validez and promdes_fecha_finalizacion_validez)
                                                    and 
                                                        promdes_cupon_descuento  is null
                                            )productos
                                            where productos.prodprom_prod_producto_id = ` + producto.pcdc_prod_producto_id + `;
                                            `, { type: sequelize.QueryTypes.SELECT} );
                                            const mejor_descuento = await sequelize.query(`
                                            select
                                                case 
                                                    when max(mejor_descuento.descuento) <= 9 then cast(concat(0, max(mejor_descuento.descuento)) as integer)
                                                    else max(mejor_descuento.descuento) 
                                                end as mejor_descuento
                                            from( 
                                                select 
                                                    prod_descuento as descuento
                                                from productos p 
                                                where prod_producto_id  = ` + producto.pcdc_prod_producto_id + `
                                                union
                                                select 
                                                    m.mar_descuento as descuento
                                                from productos p2 
                                                left join marcas m ON  m.mar_marca_id  = p2.prod_mar_marca_id  
                                                where p2.prod_producto_id  = ` + producto.pcdc_prod_producto_id + `
                                                union 
                                                select 
                                                    case 
                                                        when sn.sn_descuento >= ldp.listp_descuento then sn.sn_descuento
                                                        when ldp.listp_descuento >= sn.sn_descuento then ldp.listp_descuento
                                                    end as descuento
                                                from socios_negocio sn 
                                                left join listas_de_precios ldp on ldp.listp_lista_de_precio_id  = sn.sn_socios_negocio_id 
                                                where sn.sn_socios_negocio_id  = ` + socio + `
                                            )mejor_descuento;`, { type: sequelize.QueryTypes.SELECT });
                                            const descuento_porcentaje_or_monto_fijo = await sequelize.query(`
                                            select 
                                                *
                                            from(
                                                select
                                                    pd.promdes_tipo_descuento_id,
                                                    pd.promdes_promocion_descuento_id,
                                                    pd.promdes_descuento_exacto,
                                                    pd.promdes_fecha_inicio_validez, 
                                                    pd.promdes_fecha_finalizacion_validez,
                                                    pp.prodprom_prod_producto_id,
                                                    pd.promdes_tipo_descuento_id 
                                                from promociones_descuentos pd
                                                left join productos_promociones pp  on pp.prodprom_promdes_promocion_descuento_id  = pd.promdes_promocion_descuento_id 
                                                where 
                                                    (promdes_tipo_descuento_id = ` + statusControllers.TIPO_PROMOCION.Porcentaje + ` or promdes_tipo_descuento_id  = ` + statusControllers.TIPO_PROMOCION['Monto fijo'] + `)
                                                    and
                                                        promdes_estatus_id  = ` + statusControllers.ESTATUS_PROMOCION.ACTIVA + `
                                                    and
                                                    (current_date between  promdes_fecha_inicio_validez and promdes_fecha_finalizacion_validez)
                                                    and 
                                                    promdes_carrito_articulo is true
                                                    and 
                                                        promdes_cupon_descuento  is null
                                            )productos
                                            where productos.prodprom_prod_producto_id = ` +  producto.pcdc_prod_producto_id + `
                                            `, 
                                            {
                                                type: sequelize.QueryTypes.SELECT
                                            });
                                            if(producto.pcdc_cupon_aplicado == false){
                                                if(producto_con_promocion.length > 0){
                                                    let regalados = await cantidadAgregar(producto.pcdc_producto_cantidad, producto_con_promocion[0].promdes_tipo_descuento_id);
                                                    let total = await producto.pcdc_producto_cantidad - regalados;
                                                    producto_carrito.update({
                                                            pcdc_producto_cantidad: total,
                                                            pcdc_cantidad_producto_promocion: regalados,
                                                            pcdc_prod_producto_id_promocion: producto.pcdc_prod_producto_id,
                                                            pcdc_precio: mejor_precio[0].min,
                                                            pcdc_prod_producto_id_regalo: (producto_regalo.length > 0) ? producto_regalo[0].promdes_sku_gift : null,
                                                            pcdc_cantidad_producto_regalo: (producto_regalo.length > 0) ? producto.pcdc_producto_cantidad : null,
                                                            pcdc_mejor_descuento: (mejor_descuento.length > 0) ?  mejor_descuento[0].mejor_descuento : 0,
                                                            pcdc_tipo_prmocion_individual: (descuento_porcentaje_or_monto_fijo.length > 0) ? descuento_porcentaje_or_monto_fijo[0].promdes_tipo_descuento_id : null,
                                                            pcdc_descuento_promocion: (descuento_porcentaje_or_monto_fijo.length > 0) ? descuento_porcentaje_or_monto_fijo[0].promdes_descuento_exacto : null
    
                                                    });
                                                }else{
                                                    producto_carrito.update({
                                                        pcdc_precio: mejor_precio[0].min,
                                                        pcdc_prod_producto_id_regalo: (producto_regalo.length > 0) ? producto_regalo[0].promdes_sku_gift : null,
                                                        pcdc_cantidad_producto_regalo: (producto_regalo.length > 0) ? producto.pcdc_producto_cantidad : null,
                                                        pcdc_mejor_descuento: (mejor_descuento.length > 0) ?  mejor_descuento[0].mejor_descuento : 0,
                                                        pcdc_tipo_prmocion_individual: (descuento_porcentaje_or_monto_fijo.length > 0) ? descuento_porcentaje_or_monto_fijo[0].promdes_tipo_descuento_id : null,
                                                        pcdc_descuento_promocion: (descuento_porcentaje_or_monto_fijo.length > 0) ? descuento_porcentaje_or_monto_fijo[0].promdes_descuento_exacto : null
                                                    });
                                                }
                                            }
                                            if((carrito_de_compra.dataValues.productos_carrito_de_compras.length -1) == indexProducto){
                                                const almacenes_fisicos = await models.Almacenes.findAll({
                                                    where: {
                                                        alm_cmm_estatus_id: statusControllers.ESTATUS_ALMACENES.ACTIVA,
                                                        alm_tipo_almacen: statusControllers.TIPO_ALMACEN.FISICO
                                                    }
                                                });
                                                const producto_carrito = await models.ProductoCarritoDeCompra.findOne({
                                                    where:{
                                                        pcdc_carrito_de_compra_id: producto.dataValues.pcdc_carrito_de_compra_id,
                                                        pcdc_prod_producto_id: producto.dataValues.pcdc_prod_producto_id
                                                    }
                                                });
                                                almacenes_fisicos.forEach(async function(almacenFisico, indexAlmacenFisico){
                                                    const almacen_origen = await sequelize.query(`
                                                    select 
                                                        distinct(total_stock.alm_almacen_id) as almacen,
                                                        total_stock.fisico as fisico,
                                                        case 
                                                            when count(distinct(total_stock.fisico)) = 1  then
                                                                sum(total_stock.sp_cantidad)
                                                            when count(distinct(total_stock.fisico))  > 1 then
                                                                total_stock.sp_cantidad
                                                        end as cantidad,
                                                        total_stock.prod_disponible_backorder
                                                    from( 
                                                        ---Almacen Fisico general tercer
                                                        select
                                                            distinct (a.alm_almacen_id),
                                                            a.alm_almacen_id as fisico,
                                                            sp.sp_cantidad,
                                                            p.prod_disponible_backorder
                                                        from almacenes a 
                                                        left join almacenes_logistica al  on al.almlog_almacen_codigo = a."alm_codigoAlmacen" 
                                                        left join stocks_productos sp ON sp.sp_almacen_id = a.alm_almacen_id 
                                                        left join productos p  on p.prod_producto_id  = sp.sp_prod_producto_id 
                                                        where sp.sp_almacen_id = ` + almacenFisico.dataValues.alm_almacen_id + ` and  a.alm_cmm_estatus_id = ` + statusControllers.ESTATUS_ALMACENES.ACTIVA + ` and sp.sp_prod_producto_id  = ` + producto.dataValues.pcdc_prod_producto_id + `
                                                        union 
                                                        ---Almacen virtual asignado a socio
                                                        select
                                                            distinct(a.alm_almacen_id),
                                                            a2.alm_almacen_id as fisico,
                                                            sp.sp_cantidad,
                                                            p2.prod_disponible_backorder
                                                        from almacenes a 
                                                        left join almacenes a2 on a2.alm_almacen_id = a.alm_fisico
                                                        left join stocks_productos sp on sp.sp_almacen_id  = a.alm_almacen_id 
                                                        left join productos p2 on p2.prod_producto_id  = sp.sp_prod_producto_id 
                                                        left join almacenes_logistica al on al.almlog_almacen_codigo = a2."alm_codigoAlmacen" 
                                                        where a.alm_almacen_id  = ` + almacen_virtual + ` and a.alm_cmm_estatus_id = ` + statusControllers.ESTATUS_ALMACENES.ACTIVA + ` and sp.sp_prod_producto_id  = ` + producto.dataValues.pcdc_prod_producto_id + `
                                                    )total_stock
                                                    group by total_stock.fisico, total_stock.sp_cantidad, total_stock.alm_almacen_id, total_stock.prod_disponible_backorder;
                                                    `, 
                                                    {
                                                        type: sequelize.QueryTypes.SELECT
                                                    });
                                                    console.log('RESULTADO CONSULTA ', almacen_origen, almacen_origen[0].cantidad, producto_carrito.dataValues.pcdc_producto_cantidad)
                                                    if(Number(almacen_origen[0].cantidad) > producto_carrito.dataValues.pcdc_producto_cantidad && (producto.dataValues.pcdc_validado == false)){
                                                        await producto_carrito.update({
                                                            pcdc_almacen_surtido: almacen_origen[0].fisico,
                                                            pcdc_validado: true
                                                        });
                                                    }if((Number(almacen_origen[0].cantidad) < producto_carrito.dataValues.pcdc_producto_cantidad) && (producto.dataValues.pcdc_validado == false)){
                                                        if((almacen_origen[0].prod_disponible_backorder) && (producto.dataValues.pcdc_validado == false)){
                                                            await producto_carrito.update({
                                                                pcdc_back_order: true,
                                                                pcdc_validado: true
                                                            });
                                                        }else if(producto.dataValues.pcdc_validado == false){
                                                            await producto_carrito.update({
                                                                pcdc_no_disponible_para_compra: true,
                                                                pcdc_producto_cantidad: 0,
                                                                pcdc_validado: true
                                                            });
                                                        }
                                                    }
                                                    if((almacenes_fisicos.length -1) == indexAlmacenFisico){
                                                        if((productos_carrito_de_compras.length -1) == indexProducto){
                                                            
                                                            const productos_carrito_de_compras = await models.ProductoCarritoDeCompra.findAll({
                                                                where: {
                                                                    pcdc_carrito_de_compra_id: carrito_de_compra.dataValues.cdc_carrito_de_compra_id
                                                                },
                                                                order: [
                                                                    ['pcdc_prod_producto_id', 'ASC']
                                                                ],
                                                                attributes: {
                                                                    exclude: ['pcdc_validado']
                                                                },
                                                                include: [
                                                                    {
                                                                        model: models.Producto,
                                                                        attributes: {
                                                                            exclude: [
                                                                                'prod_usu_usuario_creado_id',
                                                                                'createdAt',
                                                                                'prod_usu_usuario_modificado_id',
                                                                                'updatedAt',
                                                                                'prod_descripcion_corta',
                                                                                'prod_unidad_medida_venta',
                                                                                'prod_altura',
                                                                                'prod_ancho',
                                                                                'prod_longitud',
                                                                                'prod_peso',
                                                                                'prod_volumen',
                                                                                'prod_total_stock',
                                                                                'prod_proveedor_id',
                                                                                'prod_meta_titulo',
                                                                                'prod_meta_descripcion',
                                                                                'prod_is_kit',
                                                                                'prod_viñetas',
                                                                                'prod_calificacion_promedio',
                                                                                'prod_productos_coleccion_relacionados_id',
                                                                                'prod_productos_coleccion_accesorios_id',
                                                                                'prod_video_url'
                                                                            ]
                                                                        },
                                                                        include: [
                                                                            {
                                                                                model: models.ImagenProducto,
                                                                                attributes: {
                                                                                    exclude: [
                                                                                        'imgprod_imagen_producto_id',
                                                                                        'imgprod_usu_usuario_creador_id',
                                                                                        'createdAt',
                                                                                        'updatedAt'
                                                                                    ]
                                                                                }
                                                                            }
                                                                        ]
                                                                    }
                                                                ]
                                                            });
                                                            res.status(200).send({
                                                                message: 'Producto agregado correctamente.',
                                                                carrito_de_compra,
                                                                productos_carrito_de_compras,
                                                                jsonToProject,
                                                                porcentajeDeAprobacion
                                                            });  
                                                        }
                                                    }
                                                });        
                                            }
                                        });
                                    }
                                });
                            }else{
                                const carrito_de_compra =  await models.CarritoDeCompra.findOne({
                                    where: {
                                        cdc_carrito_de_compra_id: carrito_id
                                    },
                                    include: [
                                        {
                                            model: models.ProductoCarritoDeCompra,
                                            attributes: {
                                                exclude: [
                                                    'createdAt',
                                                    'updatedAt',
                                                ]
                                            }
                                        }
                                    ]
                                });
                                carrito_de_compra.dataValues.productos_carrito_de_compras.forEach(async function(producto, indexProducto){
                                    const producto_carrito = await models.ProductoCarritoDeCompra.findOne({
                                        where: {
                                            pcdc_carrito_de_compra_id: producto.pcdc_carrito_de_compra_id,
                                            pcdc_prod_producto_id: producto.pcdc_prod_producto_id
                                        }
                                    });
                                    
                                    //Validamos promociones activas
                                    const producto_con_promocion =  await sequelize.query(`         
                                    select 
                                        *
                                    from(
                                        select
                                            pd.promdes_promocion_descuento_id,
                                            pd.promdes_fecha_inicio_validez, 
                                            pd.promdes_fecha_finalizacion_validez,
                                            pp.prodprom_prod_producto_id,
                                            pd.promdes_tipo_descuento_id 
                                        from promociones_descuentos pd
                                        left join productos_promociones pp  on pp.prodprom_promdes_promocion_descuento_id  = pd.promdes_promocion_descuento_id 
                                        where 
                                            (promdes_tipo_descuento_id = ` + statusControllers.TIPO_PROMOCION['2 X 1'] + ` or promdes_tipo_descuento_id  = ` + statusControllers.TIPO_PROMOCION['3 X 2'] + `)
                                            and
                                                promdes_estatus_id  = ` + statusControllers.ESTATUS_PROMOCION.ACTIVA + `
                                            and
                                            (current_date between  promdes_fecha_inicio_validez and promdes_fecha_finalizacion_validez)
                                            and 
                                                promdes_cupon_descuento  is null
                                    )productos
                                    where productos.prodprom_prod_producto_id = ` + producto.pcdc_prod_producto_id + `;`, 
                                    { type: sequelize.QueryTypes.SELECT });
                                    const mejor_precio =  await sequelize.query(`         
                                    select
                                        case 
                                            when min(mejor_precio.prod_precio) <= 0 then max(mejor_precio.prod_precio) 
                                            else
                                                min(mejor_precio.prod_precio) 
                                        end as min
                                    from (
                                        select 
                                            prod_precio
                                        from productos p 
                                        where prod_producto_id  = ` + producto.pcdc_prod_producto_id + `
                                        union 
                                        select
                                            pldp.pl_precio_producto 
                                        from productos_lista_de_precio pldp 
                                        where pldp.pl_prod_producto_id = ` + producto.pcdc_prod_producto_id + ` and pldp.pl_listp_lista_de_precio_id  = ` + listaPrecio + `
                                    )mejor_precio;`, 
                                    { type: sequelize.QueryTypes.SELECT });
                                    const producto_regalo = await sequelize.query(`
                                    select 
                                    *
                                    from(
                                        select
                                            pd.promdes_sku_gift,
                                            pd.promdes_promocion_descuento_id,
                                            pd.promdes_fecha_inicio_validez, 
                                            pd.promdes_fecha_finalizacion_validez,
                                            pp.prodprom_prod_producto_id,
                                            pd.promdes_tipo_descuento_id 
                                        from promociones_descuentos pd
                                        left join productos_promociones pp  on pp.prodprom_promdes_promocion_descuento_id  = pd.promdes_promocion_descuento_id 
                                        where 
                                            (promdes_tipo_descuento_id = ` + statusControllers.TIPO_PROMOCION['Regalo'] + `)
                                            and
                                                promdes_estatus_id  = `+ statusControllers.ESTATUS_PROMOCION.ACTIVA +`
                                            and
                                            (current_date between  promdes_fecha_inicio_validez and promdes_fecha_finalizacion_validez)
                                            and 
                                                promdes_cupon_descuento  is null
                                    )productos
                                    where productos.prodprom_prod_producto_id = ` + producto.pcdc_prod_producto_id + `;
                                    `, { type: sequelize.QueryTypes.SELECT} );
                                    const mejor_descuento = await sequelize.query(`
                                    select
                                        case 
                                            when max(mejor_descuento.descuento) <= 9 then cast(concat(0, max(mejor_descuento.descuento)) as integer)
                                            else max(mejor_descuento.descuento) 
                                        end as mejor_descuento
                                    from( 
                                        select 
                                            prod_descuento as descuento
                                        from productos p 
                                        where prod_producto_id  = ` + producto.pcdc_prod_producto_id + `
                                        union
                                        select 
                                            m.mar_descuento as descuento
                                        from productos p2 
                                        left join marcas m ON  m.mar_marca_id  = p2.prod_mar_marca_id  
                                        where p2.prod_producto_id  = ` + producto.pcdc_prod_producto_id + `
                                        union 
                                        select 
                                            case 
                                                when sn.sn_descuento >= ldp.listp_descuento then sn.sn_descuento
                                                when ldp.listp_descuento >= sn.sn_descuento then ldp.listp_descuento
                                            end as descuento
                                        from socios_negocio sn 
                                        left join listas_de_precios ldp on ldp.listp_lista_de_precio_id  = sn.sn_socios_negocio_id 
                                        where sn.sn_socios_negocio_id  = ` + socio + `
                                    )mejor_descuento;`, { type: sequelize.QueryTypes.SELECT });
                                    const descuento_porcentaje_or_monto_fijo = await sequelize.query(`
                                    select 
                                        *
                                    from(
                                        select
                                            pd.promdes_tipo_descuento_id,
                                            pd.promdes_promocion_descuento_id,
                                            pd.promdes_descuento_exacto,
                                            pd.promdes_fecha_inicio_validez, 
                                            pd.promdes_fecha_finalizacion_validez,
                                            pp.prodprom_prod_producto_id,
                                            pd.promdes_tipo_descuento_id 
                                        from promociones_descuentos pd
                                        left join productos_promociones pp  on pp.prodprom_promdes_promocion_descuento_id  = pd.promdes_promocion_descuento_id 
                                        where 
                                            (promdes_tipo_descuento_id = ` + statusControllers.TIPO_PROMOCION.Porcentaje + ` or promdes_tipo_descuento_id  = ` + statusControllers.TIPO_PROMOCION['Monto fijo'] + `)
                                            and
                                                promdes_estatus_id  = ` + statusControllers.ESTATUS_PROMOCION.ACTIVA + `
                                            and
                                            (current_date between  promdes_fecha_inicio_validez and promdes_fecha_finalizacion_validez)
                                            and 
                                            promdes_carrito_articulo is true
                                            and 
                                                promdes_cupon_descuento  is null
                                    )productos
                                    where productos.prodprom_prod_producto_id = ` +  producto.pcdc_prod_producto_id + `
                                    `, 
                                    {
                                        type: sequelize.QueryTypes.SELECT
                                    })
                                    if(producto.pcdc_cupon_aplicado == false){
                                        if(producto_con_promocion.length > 0){
                                            let regalados = await cantidadAgregar(producto.pcdc_producto_cantidad, producto_con_promocion[0].promdes_tipo_descuento_id);
                                            let total = await producto.pcdc_producto_cantidad - regalados;
                                            producto_carrito.update({
                                                    pcdc_producto_cantidad: total,
                                                    pcdc_prod_producto_id_promocion: producto.pcdc_prod_producto_id,
                                                    pcdc_cantidad_producto_promocion: regalados,
                                                    pcdc_precio: mejor_precio[0].min,
                                                    pcdc_prod_producto_id_regalo: (producto_regalo.length > 0) ? producto_regalo[0].promdes_sku_gift : null,
                                                    pcdc_cantidad_producto_regalo: (producto_regalo.length > 0) ? producto.pcdc_producto_cantidad : null,
                                                    pcdc_mejor_descuento: (mejor_descuento.length > 0) ?  mejor_descuento[0].mejor_descuento : 0,
                                                    pcdc_tipo_prmocion_individual: (descuento_porcentaje_or_monto_fijo.length > 0) ? descuento_porcentaje_or_monto_fijo[0].promdes_tipo_descuento_id : null,
                                                    pcdc_descuento_promocion: (descuento_porcentaje_or_monto_fijo.length > 0) ? descuento_porcentaje_or_monto_fijo[0].promdes_descuento_exacto : null
    
                                            });
                                        }else{
                                            producto_carrito.update({
                                                pcdc_precio: mejor_precio[0].min,
                                                pcdc_prod_producto_id_regalo: (producto_regalo.length > 0) ? producto_regalo[0].promdes_sku_gift : null,
                                                pcdc_cantidad_producto_regalo: (producto_regalo.length > 0) ? producto.pcdc_producto_cantidad : null,
                                                pcdc_mejor_descuento: (mejor_descuento.length > 0) ?  mejor_descuento[0].mejor_descuento : 0,
                                                pcdc_tipo_prmocion_individual: (descuento_porcentaje_or_monto_fijo.length > 0) ? descuento_porcentaje_or_monto_fijo[0].promdes_tipo_descuento_id : null,
                                                pcdc_descuento_promocion: (descuento_porcentaje_or_monto_fijo.length > 0) ? descuento_porcentaje_or_monto_fijo[0].promdes_descuento_exacto : null
                                            });
                                        }
                                    }    
                                    if((carrito_de_compra.dataValues.productos_carrito_de_compras.length -1) == indexProducto){
                                        //REGRESAMO CARRITO DETALLE
                                        const carrito_de_compra =  await models.CarritoDeCompra.findOne({
                                            where: {
                                                cdc_carrito_de_compra_id: carrito_id
                                            }
                                        });
    
                                        const productos_carrito_de_compras = await models.ProductoCarritoDeCompra.findAll({
                                            where: {
                                                pcdc_carrito_de_compra_id: carrito_de_compra.dataValues.cdc_carrito_de_compra_id
                                            },
                                            order: [
                                                ['pcdc_prod_producto_id', 'ASC']
                                            ]
                                        });

                                        productos_carrito_de_compras.forEach(async function(producto, indexProducto){
                                            const almacenes_fisicos = await models.Almacenes.findAll({
                                                where: {
                                                    alm_cmm_estatus_id: statusControllers.ESTATUS_ALMACENES.ACTIVA,
                                                    alm_tipo_almacen: statusControllers.TIPO_ALMACEN.FISICO
                                                }
                                            });
                                            const producto_carrito = await models.ProductoCarritoDeCompra.findOne({
                                                where:{
                                                    pcdc_carrito_de_compra_id: producto.dataValues.pcdc_carrito_de_compra_id,
                                                    pcdc_prod_producto_id: producto.dataValues.pcdc_prod_producto_id
                                                }
                                            });
                                            almacenes_fisicos.forEach(async function(almacenFisico, indexAlmacenFisico){
                                                const almacen_origen = await sequelize.query(`
                                                select 
                                                    distinct(total_stock.alm_almacen_id) as almacen,
                                                    total_stock.fisico as fisico,
                                                    case 
                                                        when count(distinct(total_stock.fisico)) = 1  then
                                                            sum(total_stock.sp_cantidad)
                                                        when count(distinct(total_stock.fisico))  > 1 then
                                                            total_stock.sp_cantidad
                                                    end as cantidad,
                                                    total_stock.prod_disponible_backorder
                                                from( 
                                                    ---Almacen Fisico general tercer
                                                    select
                                                        distinct (a.alm_almacen_id),
                                                        a.alm_almacen_id as fisico,
                                                        sp.sp_cantidad,
                                                        p.prod_disponible_backorder
                                                    from almacenes a 
                                                    left join almacenes_logistica al  on al.almlog_almacen_codigo = a."alm_codigoAlmacen" 
                                                    left join stocks_productos sp ON sp.sp_almacen_id = a.alm_almacen_id 
                                                    left join productos p  on p.prod_producto_id  = sp.sp_prod_producto_id 
                                                    where sp.sp_almacen_id = ` + almacenFisico.dataValues.alm_almacen_id + ` and  a.alm_cmm_estatus_id = ` + statusControllers.ESTATUS_ALMACENES.ACTIVA + ` and sp.sp_prod_producto_id  = ` + producto.dataValues.pcdc_prod_producto_id + `
                                                    union 
                                                    ---Almacen virtual asignado a socio
                                                    select
                                                        distinct(a.alm_almacen_id),
                                                        a2.alm_almacen_id as fisico,
                                                        sp.sp_cantidad,
                                                        p2.prod_disponible_backorder
                                                    from almacenes a 
                                                    left join almacenes a2 on a2.alm_almacen_id = a.alm_fisico
                                                    left join stocks_productos sp on sp.sp_almacen_id  = a.alm_almacen_id 
                                                    left join productos p2 on p2.prod_producto_id  = sp.sp_prod_producto_id 
                                                    left join almacenes_logistica al on al.almlog_almacen_codigo = a2."alm_codigoAlmacen" 
                                                    where a.alm_almacen_id  = ` + almacen_virtual + ` and a.alm_cmm_estatus_id = ` + statusControllers.ESTATUS_ALMACENES.ACTIVA + ` and sp.sp_prod_producto_id  = ` + producto.dataValues.pcdc_prod_producto_id + `
                                                )total_stock
                                                group by total_stock.fisico, total_stock.sp_cantidad, total_stock.alm_almacen_id, total_stock.prod_disponible_backorder;
                                                `, 
                                                {
                                                    type: sequelize.QueryTypes.SELECT
                                                });
                                                console.log('RESULTADO CONSULTA ', almacen_origen, almacen_origen[0].cantidad, producto_carrito.dataValues.pcdc_producto_cantidad)
                                                if(Number(almacen_origen[0].cantidad) > producto_carrito.dataValues.pcdc_producto_cantidad && (producto.dataValues.pcdc_validado == false)){
                                                    await producto_carrito.update({
                                                        pcdc_almacen_surtido: almacen_origen[0].fisico,
                                                        pcdc_validado: true
                                                    });
                                                }if((Number(almacen_origen[0].cantidad) < producto_carrito.dataValues.pcdc_producto_cantidad) && (producto.dataValues.pcdc_validado == false)){
                                                    if((almacen_origen[0].prod_disponible_backorder) && (producto.dataValues.pcdc_validado == false)){
                                                        await producto_carrito.update({
                                                            pcdc_back_order: true,
                                                            pcdc_validado: true
                                                        });
                                                    }else if(producto.dataValues.pcdc_validado == false){
                                                        await producto_carrito.update({
                                                            pcdc_no_disponible_para_compra: true,
                                                            pcdc_producto_cantidad: 0,
                                                            pcdc_validado: true
                                                        });
                                                    }
                                                }
                                                if((almacenes_fisicos.length -1) == indexAlmacenFisico){
                                                    if((productos_carrito_de_compras.length -1) == indexProducto){
                                                        
                                                        const productos_carrito_de_compras = await models.ProductoCarritoDeCompra.findAll({
                                                            where: {
                                                                pcdc_carrito_de_compra_id: carrito_de_compra.dataValues.cdc_carrito_de_compra_id
                                                            },
                                                            order: [
                                                                ['pcdc_prod_producto_id', 'ASC']
                                                            ],
                                                            attributes: {
                                                                exclude: ['pcdc_validado']
                                                            },
                                                            include: [
                                                                {
                                                                    model: models.Producto,
                                                                    attributes: {
                                                                        exclude: [
                                                                            'prod_usu_usuario_creado_id',
                                                                            'createdAt',
                                                                            'prod_usu_usuario_modificado_id',
                                                                            'updatedAt',
                                                                            'prod_descripcion_corta',
                                                                            'prod_unidad_medida_venta',
                                                                            'prod_altura',
                                                                            'prod_ancho',
                                                                            'prod_longitud',
                                                                            'prod_peso',
                                                                            'prod_volumen',
                                                                            'prod_total_stock',
                                                                            'prod_proveedor_id',
                                                                            'prod_meta_titulo',
                                                                            'prod_meta_descripcion',
                                                                            'prod_is_kit',
                                                                            'prod_viñetas',
                                                                            'prod_calificacion_promedio',
                                                                            'prod_productos_coleccion_relacionados_id',
                                                                            'prod_productos_coleccion_accesorios_id',
                                                                            'prod_video_url'
                                                                        ]
                                                                    },
                                                                    include: [
                                                                        {
                                                                            model: models.ImagenProducto,
                                                                            attributes: {
                                                                                exclude: [
                                                                                    'imgprod_imagen_producto_id',
                                                                                    'imgprod_usu_usuario_creador_id',
                                                                                    'createdAt',
                                                                                    'updatedAt'
                                                                                ]
                                                                            }
                                                                        }
                                                                    ]
                                                                }
                                                            ]
                                                        });
                                                        res.status(200).send({
                                                            message: 'Producto agregado correctamente.',
                                                            carrito_de_compra,
                                                            productos_carrito_de_compras,
                                                            jsonToProject,
                                                            porcentajeDeAprobacion
                                                        });  
                                                    }
                                                }
                                            });                                                        
                                        });      
                                    }
                                });
    
                            }
                        }
                    });
                }else{
                    let to_ids = await idsProyectos.length > 0 ? idsProyectos : 0 ;
                    const productos_de_carrito_total = await sequelize.query(`
                    select
                        count(distinct(pcdc.pcdc_prod_producto_id)) as incluidos
                    from carrito_de_compras cdc 
                    inner join productos_carrito_de_compra pcdc on pcdc.pcdc_carrito_de_compra_id  = cdc.cdc_carrito_de_compra_id 
                    where 
                        cdc.cdc_carrito_de_compra_id  = ` + carrito_id + `
                        and
                        pcdc.pcdc_prod_producto_id  in (` + to_ids + `);            
                    `, {
                        type: sequelize.QueryTypes.SELECT
                    });

                    const productos_de_carrito = await sequelize.query(`
                    select
                        count(distinct(pcdc.pcdc_prod_producto_id)) as total
                    from carrito_de_compras cdc 
                    inner join productos_carrito_de_compra pcdc on pcdc.pcdc_carrito_de_compra_id  = cdc.cdc_carrito_de_compra_id 
                    where 
                        cdc.cdc_carrito_de_compra_id  = ` + carrito_id + `;            
                    `, {
                        type: sequelize.QueryTypes.SELECT
                    });

                    let porcentajeDeAprobacion = await Number(((Number(productos_de_carrito_total[0].incluidos) / Number(productos_de_carrito[0].total)) * 100).toFixed(2));
                    let jsonToProject = [];
                    if(marcas_con_limitantes.length > 0){
                        marcas_con_limitantes.forEach(async function(marca, indexMarca){
                            const validacionMarca = await sequelize.query(`
                            select
                                sum(sumatotal.precio_con_descuento) as total,
                                sumatotal.marca,
                                m.mar_importe,
                                case 
                                    when m.mar_importe  < sum(sumatotal.precio_con_descuento) then true
                                    when m.mar_importe  > sum(sumatotal.precio_con_descuento) then false
                                end as cumple
                            from(
                                select
                                    descuento.pcdc_producto_cantidad,
                                    descuento.prod_mar_marca_id as marca,
                                    case 
                                        when descuento.pcdc_mejor_descuento >= 10 then  descuento.pcdc_producto_cantidad * (descuento.pcdc_precio -  (descuento.pcdc_precio * cast(concat('0.' || descuento.pcdc_mejor_descuento) as float)))
                                        when descuento.pcdc_mejor_descuento <= 9 then   descuento.pcdc_producto_cantidad * (descuento.pcdc_precio -  (descuento.pcdc_precio * cast(concat('0.0' || descuento.pcdc_mejor_descuento) as float)))
                                    end as precio_con_descuento,
                                    *
                                from (
                                    select 
                                        *
                                    from productos_carrito_de_compra pcdc 
                                    left join productos p  on p.prod_producto_id  = pcdc.pcdc_prod_producto_id
                                    where 
                                        pcdc.pcdc_carrito_de_compra_id  = ` + carrito_id + `
                                        and 
                                        p.prod_mar_marca_id  = ` + marca.mar_marca_id + `
                                )descuento
                            )sumatotal
                            left join marcas m on m.mar_marca_id  = sumatotal.marca
                            group  by sumatotal.marca, m.mar_importe;
                            `, {
                                type: sequelize.QueryTypes.SELECT
                            });
                            jsonToProject.push(validacionMarca[0]);
                            if((marcas_con_limitantes.length -1) == indexMarca){
                                const carrito_de_compra =  await models.CarritoDeCompra.findOne({
                                    where: {
                                        cdc_carrito_de_compra_id: carrito_id
                                    },
                                    include: [
                                        {
                                            model: models.ProductoCarritoDeCompra,
                                            attributes: {
                                                exclude: [
                                                    'createdAt',
                                                    'updatedAt',
                                                ]
                                            }
                                        }
                                    ]
                                });
                                carrito_de_compra.dataValues.productos_carrito_de_compras.forEach(async function(producto, indexProducto){
                                    const producto_carrito = await models.ProductoCarritoDeCompra.findOne({
                                        where: {
                                            pcdc_carrito_de_compra_id: producto.pcdc_carrito_de_compra_id,
                                            pcdc_prod_producto_id: producto.pcdc_prod_producto_id
                                        }
                                    });
                                    
                                    //Validamos promociones activas
                                    const producto_con_promocion =  await sequelize.query(`         
                                    select 
                                        *
                                    from(
                                        select
                                            pd.promdes_promocion_descuento_id,
                                            pd.promdes_fecha_inicio_validez, 
                                            pd.promdes_fecha_finalizacion_validez,
                                            pp.prodprom_prod_producto_id,
                                            pd.promdes_tipo_descuento_id 
                                        from promociones_descuentos pd
                                        left join productos_promociones pp  on pp.prodprom_promdes_promocion_descuento_id  = pd.promdes_promocion_descuento_id 
                                        where 
                                            (promdes_tipo_descuento_id = ` + statusControllers.TIPO_PROMOCION['2 X 1'] + ` or promdes_tipo_descuento_id  = ` + statusControllers.TIPO_PROMOCION['3 X 2'] + `)
                                            and
                                                promdes_estatus_id  = ` + statusControllers.ESTATUS_PROMOCION.ACTIVA + `
                                            and
                                            (current_date between  promdes_fecha_inicio_validez and promdes_fecha_finalizacion_validez)
                                            and 
                                                promdes_cupon_descuento  is null
                                    )productos
                                    where productos.prodprom_prod_producto_id = ` + producto.pcdc_prod_producto_id + `;`, 
                                    { type: sequelize.QueryTypes.SELECT });
                                    const mejor_precio =  await sequelize.query(`         
                                    select
                                        case 
                                            when min(mejor_precio.prod_precio) <= 0 then max(mejor_precio.prod_precio) 
                                            else
                                                min(mejor_precio.prod_precio) 
                                        end as min
                                    from (
                                        select 
                                            prod_precio
                                        from productos p 
                                        where prod_producto_id  = ` + producto.pcdc_prod_producto_id + `
                                        union 
                                        select
                                            pldp.pl_precio_producto 
                                        from productos_lista_de_precio pldp 
                                        where pldp.pl_prod_producto_id = ` + producto.pcdc_prod_producto_id + ` and pldp.pl_listp_lista_de_precio_id  = ` + listaPrecio + `
                                    )mejor_precio;`, 
                                    { type: sequelize.QueryTypes.SELECT });
                                    const producto_regalo = await sequelize.query(`
                                    select 
                                    *
                                    from(
                                        select
                                            pd.promdes_sku_gift,
                                            pd.promdes_promocion_descuento_id,
                                            pd.promdes_fecha_inicio_validez, 
                                            pd.promdes_fecha_finalizacion_validez,
                                            pp.prodprom_prod_producto_id,
                                            pd.promdes_tipo_descuento_id 
                                        from promociones_descuentos pd
                                        left join productos_promociones pp  on pp.prodprom_promdes_promocion_descuento_id  = pd.promdes_promocion_descuento_id 
                                        where 
                                            (promdes_tipo_descuento_id = ` + statusControllers.TIPO_PROMOCION['Regalo'] + `)
                                            and
                                                promdes_estatus_id  = `+ statusControllers.ESTATUS_PROMOCION.ACTIVA +`
                                            and
                                            (current_date between  promdes_fecha_inicio_validez and promdes_fecha_finalizacion_validez)
                                            and 
                                                promdes_cupon_descuento  is null
                                    )productos
                                    where productos.prodprom_prod_producto_id = ` + producto.pcdc_prod_producto_id + `;
                                    `, { type: sequelize.QueryTypes.SELECT} );
                                    const mejor_descuento = await sequelize.query(`
                                    select
                                        case 
                                            when max(mejor_descuento.descuento) <= 9 then cast(concat(0, max(mejor_descuento.descuento)) as integer)
                                            else max(mejor_descuento.descuento) 
                                        end as mejor_descuento
                                    from( 
                                        select 
                                            prod_descuento as descuento
                                        from productos p 
                                        where prod_producto_id  = ` + producto.pcdc_prod_producto_id + `
                                        union
                                        select 
                                            m.mar_descuento as descuento
                                        from productos p2 
                                        left join marcas m ON  m.mar_marca_id  = p2.prod_mar_marca_id  
                                        where p2.prod_producto_id  = ` + producto.pcdc_prod_producto_id + `
                                        union 
                                        select 
                                            case 
                                                when sn.sn_descuento >= ldp.listp_descuento then sn.sn_descuento
                                                when ldp.listp_descuento >= sn.sn_descuento then ldp.listp_descuento
                                            end as descuento
                                        from socios_negocio sn 
                                        left join listas_de_precios ldp on ldp.listp_lista_de_precio_id  = sn.sn_socios_negocio_id 
                                        where sn.sn_socios_negocio_id  = ` + socio + `
                                    )mejor_descuento;`, { type: sequelize.QueryTypes.SELECT });
                                    const descuento_porcentaje_or_monto_fijo = await sequelize.query(`
                                    select 
                                        *
                                    from(
                                        select
                                            pd.promdes_tipo_descuento_id,
                                            pd.promdes_promocion_descuento_id,
                                            pd.promdes_descuento_exacto,
                                            pd.promdes_fecha_inicio_validez, 
                                            pd.promdes_fecha_finalizacion_validez,
                                            pp.prodprom_prod_producto_id,
                                            pd.promdes_tipo_descuento_id 
                                        from promociones_descuentos pd
                                        left join productos_promociones pp  on pp.prodprom_promdes_promocion_descuento_id  = pd.promdes_promocion_descuento_id 
                                        where 
                                            (promdes_tipo_descuento_id = ` + statusControllers.TIPO_PROMOCION.Porcentaje + ` or promdes_tipo_descuento_id  = ` + statusControllers.TIPO_PROMOCION['Monto fijo'] + `)
                                            and
                                                promdes_estatus_id  = ` + statusControllers.ESTATUS_PROMOCION.ACTIVA + `
                                            and
                                            (current_date between  promdes_fecha_inicio_validez and promdes_fecha_finalizacion_validez)
                                            and 
                                            promdes_carrito_articulo is true
                                            and 
                                                promdes_cupon_descuento  is null
                                    )productos
                                    where productos.prodprom_prod_producto_id = ` +  producto.pcdc_prod_producto_id + `
                                    `, 
                                    {
                                        type: sequelize.QueryTypes.SELECT
                                    });
                                    if(producto.pcdc_cupon_aplicado == false){
                                        if(producto_con_promocion.length > 0){
                                            let regalados = await cantidadAgregar(producto.pcdc_producto_cantidad, producto_con_promocion[0].promdes_tipo_descuento_id);
                                            let total = await producto.pcdc_producto_cantidad - regalados;
                                            producto_carrito.update({
                                                    pcdc_producto_cantidad: total,
                                                    pcdc_cantidad_producto_promocion: regalados,
                                                    pcdc_prod_producto_id_promocion: producto.pcdc_prod_producto_id,
                                                    pcdc_precio: mejor_precio[0].min,
                                                    pcdc_prod_producto_id_regalo: (producto_regalo.length > 0) ? producto_regalo[0].promdes_sku_gift : null,
                                                    pcdc_cantidad_producto_regalo: (producto_regalo.length > 0) ? producto.pcdc_producto_cantidad : null,
                                                    pcdc_mejor_descuento: (mejor_descuento.length > 0) ?  mejor_descuento[0].mejor_descuento : 0,
                                                    pcdc_tipo_prmocion_individual: (descuento_porcentaje_or_monto_fijo.length > 0) ? descuento_porcentaje_or_monto_fijo[0].promdes_tipo_descuento_id : null,
                                                    pcdc_descuento_promocion: (descuento_porcentaje_or_monto_fijo.length > 0) ? descuento_porcentaje_or_monto_fijo[0].promdes_descuento_exacto : null

                                            });
                                        }else{
                                            producto_carrito.update({
                                                pcdc_precio: mejor_precio[0].min,
                                                pcdc_prod_producto_id_regalo: (producto_regalo.length > 0) ? producto_regalo[0].promdes_sku_gift : null,
                                                pcdc_cantidad_producto_regalo: (producto_regalo.length > 0) ? producto.pcdc_producto_cantidad : null,
                                                pcdc_mejor_descuento: (mejor_descuento.length > 0) ?  mejor_descuento[0].mejor_descuento : 0,
                                                pcdc_tipo_prmocion_individual: (descuento_porcentaje_or_monto_fijo.length > 0) ? descuento_porcentaje_or_monto_fijo[0].promdes_tipo_descuento_id : null,
                                                pcdc_descuento_promocion: (descuento_porcentaje_or_monto_fijo.length > 0) ? descuento_porcentaje_or_monto_fijo[0].promdes_descuento_exacto : null
                                            });
                                        }
                                    }
                                    if((carrito_de_compra.dataValues.productos_carrito_de_compras.length -1) == indexProducto){
                                        //REGRESAMO CARRITO DETALLE
                                        const carrito_de_compra =  await models.CarritoDeCompra.findOne({
                                            where: {
                                                cdc_carrito_de_compra_id: carrito_id
                                            }
                                        });
    
                                        const productos_carrito_de_compras = await models.ProductoCarritoDeCompra.findAll({
                                            where: {
                                                pcdc_carrito_de_compra_id: carrito_de_compra.dataValues.cdc_carrito_de_compra_id
                                            },
                                            order: [
                                                ['pcdc_prod_producto_id', 'ASC']
                                            ]
                                        });

                                        productos_carrito_de_compras.forEach(async function(producto, indexProducto){
                                            const almacenes_fisicos = await models.Almacenes.findAll({
                                                where: {
                                                    alm_cmm_estatus_id: statusControllers.ESTATUS_ALMACENES.ACTIVA,
                                                    alm_tipo_almacen: statusControllers.TIPO_ALMACEN.FISICO
                                                }
                                            });
                                            const producto_carrito = await models.ProductoCarritoDeCompra.findOne({
                                                where:{
                                                    pcdc_carrito_de_compra_id: producto.dataValues.pcdc_carrito_de_compra_id,
                                                    pcdc_prod_producto_id: producto.dataValues.pcdc_prod_producto_id
                                                }
                                            });
                                            almacenes_fisicos.forEach(async function(almacenFisico, indexAlmacenFisico){
                                                const almacen_origen = await sequelize.query(`
                                                select 
                                                    distinct(total_stock.alm_almacen_id) as almacen,
                                                    total_stock.fisico as fisico,
                                                    case 
                                                        when count(distinct(total_stock.fisico)) = 1  then
                                                            sum(total_stock.sp_cantidad)
                                                        when count(distinct(total_stock.fisico))  > 1 then
                                                            total_stock.sp_cantidad
                                                    end as cantidad,
                                                    total_stock.prod_disponible_backorder
                                                from( 
                                                    ---Almacen Fisico general tercer
                                                    select
                                                        distinct (a.alm_almacen_id),
                                                        a.alm_almacen_id as fisico,
                                                        sp.sp_cantidad,
                                                        p.prod_disponible_backorder
                                                    from almacenes a 
                                                    left join almacenes_logistica al  on al.almlog_almacen_codigo = a."alm_codigoAlmacen" 
                                                    left join stocks_productos sp ON sp.sp_almacen_id = a.alm_almacen_id 
                                                    left join productos p  on p.prod_producto_id  = sp.sp_prod_producto_id 
                                                    where sp.sp_almacen_id = ` + almacenFisico.dataValues.alm_almacen_id + ` and  a.alm_cmm_estatus_id = ` + statusControllers.ESTATUS_ALMACENES.ACTIVA + ` and sp.sp_prod_producto_id  = ` + producto.dataValues.pcdc_prod_producto_id + `
                                                    union 
                                                    ---Almacen virtual asignado a socio
                                                    select
                                                        distinct(a.alm_almacen_id),
                                                        a2.alm_almacen_id as fisico,
                                                        sp.sp_cantidad,
                                                        p2.prod_disponible_backorder
                                                    from almacenes a 
                                                    left join almacenes a2 on a2.alm_almacen_id = a.alm_fisico
                                                    left join stocks_productos sp on sp.sp_almacen_id  = a.alm_almacen_id 
                                                    left join productos p2 on p2.prod_producto_id  = sp.sp_prod_producto_id 
                                                    left join almacenes_logistica al on al.almlog_almacen_codigo = a2."alm_codigoAlmacen" 
                                                    where a.alm_almacen_id  = ` + almacen_virtual + ` and a.alm_cmm_estatus_id = ` + statusControllers.ESTATUS_ALMACENES.ACTIVA + ` and sp.sp_prod_producto_id  = ` + producto.dataValues.pcdc_prod_producto_id + `
                                                )total_stock
                                                group by total_stock.fisico, total_stock.sp_cantidad, total_stock.alm_almacen_id, total_stock.prod_disponible_backorder;
                                                `, 
                                                {
                                                    type: sequelize.QueryTypes.SELECT
                                                });
                                                console.log('RESULTADO CONSULTA ', almacen_origen, almacen_origen[0].cantidad, producto_carrito.dataValues.pcdc_producto_cantidad)
                                                if(Number(almacen_origen[0].cantidad) > producto_carrito.dataValues.pcdc_producto_cantidad && (producto.dataValues.pcdc_validado == false)){
                                                    await producto_carrito.update({
                                                        pcdc_almacen_surtido: almacen_origen[0].fisico,
                                                        pcdc_validado: true
                                                    });
                                                }if((Number(almacen_origen[0].cantidad) < producto_carrito.dataValues.pcdc_producto_cantidad) && (producto.dataValues.pcdc_validado == false)){
                                                    if((almacen_origen[0].prod_disponible_backorder) && (producto.dataValues.pcdc_validado == false)){
                                                        await producto_carrito.update({
                                                            pcdc_back_order: true,
                                                            pcdc_validado: true
                                                        });
                                                    }else if(producto.dataValues.pcdc_validado == false){
                                                        await producto_carrito.update({
                                                            pcdc_no_disponible_para_compra: true,
                                                            pcdc_producto_cantidad: 0,
                                                            pcdc_validado: true
                                                        });
                                                    }
                                                }
                                                if((almacenes_fisicos.length -1) == indexAlmacenFisico){
                                                    if((productos_carrito_de_compras.length -1) == indexProducto){
                                                        
                                                        const productos_carrito_de_compras = await models.ProductoCarritoDeCompra.findAll({
                                                            where: {
                                                                pcdc_carrito_de_compra_id: carrito_de_compra.dataValues.cdc_carrito_de_compra_id
                                                            },
                                                            order: [
                                                                ['pcdc_prod_producto_id', 'ASC']
                                                            ],
                                                            attributes: {
                                                                exclude: ['pcdc_validado']
                                                            },
                                                            include: [
                                                                {
                                                                    model: models.Producto,
                                                                    attributes: {
                                                                        exclude: [
                                                                            'prod_usu_usuario_creado_id',
                                                                            'createdAt',
                                                                            'prod_usu_usuario_modificado_id',
                                                                            'updatedAt',
                                                                            'prod_descripcion_corta',
                                                                            'prod_unidad_medida_venta',
                                                                            'prod_altura',
                                                                            'prod_ancho',
                                                                            'prod_longitud',
                                                                            'prod_peso',
                                                                            'prod_volumen',
                                                                            'prod_total_stock',
                                                                            'prod_proveedor_id',
                                                                            'prod_meta_titulo',
                                                                            'prod_meta_descripcion',
                                                                            'prod_is_kit',
                                                                            'prod_viñetas',
                                                                            'prod_calificacion_promedio',
                                                                            'prod_productos_coleccion_relacionados_id',
                                                                            'prod_productos_coleccion_accesorios_id',
                                                                            'prod_video_url'
                                                                        ]
                                                                    },
                                                                    include: [
                                                                        {
                                                                            model: models.ImagenProducto,
                                                                            attributes: {
                                                                                exclude: [
                                                                                    'imgprod_imagen_producto_id',
                                                                                    'imgprod_usu_usuario_creador_id',
                                                                                    'createdAt',
                                                                                    'updatedAt'
                                                                                ]
                                                                            }
                                                                        }
                                                                    ]
                                                                }
                                                            ]
                                                        });
                                                        res.status(200).send({
                                                            message: 'Producto agregado correctamente.',
                                                            carrito_de_compra,
                                                            productos_carrito_de_compras,
                                                            jsonToProject,
                                                            porcentajeDeAprobacion
                                                        });  
                                                    }
                                                }
                                            });                                                        
                                        });   
                                    }
                                });
                            }
                        });
                    }else{
                        const carrito_de_compra =  await models.CarritoDeCompra.findOne({
                            where: {
                                cdc_carrito_de_compra_id: carrito_id
                            },
                            include: [
                                {
                                    model: models.ProductoCarritoDeCompra,
                                    attributes: {
                                        exclude: [
                                            'createdAt',
                                            'updatedAt',
                                        ]
                                    }
                                }
                            ]
                        });
                        carrito_de_compra.dataValues.productos_carrito_de_compras.forEach(async function(producto, indexProducto){
                            const producto_carrito = await models.ProductoCarritoDeCompra.findOne({
                                where: {
                                    pcdc_carrito_de_compra_id: producto.pcdc_carrito_de_compra_id,
                                    pcdc_prod_producto_id: producto.pcdc_prod_producto_id
                                }
                            });
                            
                            //Validamos promociones activas
                            const producto_con_promocion =  await sequelize.query(`         
                            select 
                                *
                            from(
                                select
                                    pd.promdes_promocion_descuento_id,
                                    pd.promdes_fecha_inicio_validez, 
                                    pd.promdes_fecha_finalizacion_validez,
                                    pp.prodprom_prod_producto_id,
                                    pd.promdes_tipo_descuento_id 
                                from promociones_descuentos pd
                                left join productos_promociones pp  on pp.prodprom_promdes_promocion_descuento_id  = pd.promdes_promocion_descuento_id 
                                where 
                                    (promdes_tipo_descuento_id = ` + statusControllers.TIPO_PROMOCION['2 X 1'] + ` or promdes_tipo_descuento_id  = ` + statusControllers.TIPO_PROMOCION['3 X 2'] + `)
                                    and
                                        promdes_estatus_id  = ` + statusControllers.ESTATUS_PROMOCION.ACTIVA + `
                                    and
                                    (current_date between  promdes_fecha_inicio_validez and promdes_fecha_finalizacion_validez)
                                    and 
                                        promdes_cupon_descuento  is null
                            )productos
                            where productos.prodprom_prod_producto_id = ` + producto.pcdc_prod_producto_id + `;`, 
                            { type: sequelize.QueryTypes.SELECT });
                            const mejor_precio =  await sequelize.query(`         
                            select
                                case 
                                    when min(mejor_precio.prod_precio) <= 0 then max(mejor_precio.prod_precio) 
                                    else
                                        min(mejor_precio.prod_precio) 
                                end as min
                            from (
                                select 
                                    prod_precio
                                from productos p 
                                where prod_producto_id  = ` + producto.pcdc_prod_producto_id + `
                                union 
                                select
                                    pldp.pl_precio_producto 
                                from productos_lista_de_precio pldp 
                                where pldp.pl_prod_producto_id = ` + producto.pcdc_prod_producto_id + ` and pldp.pl_listp_lista_de_precio_id  = ` + listaPrecio + `
                            )mejor_precio;`, 
                            { type: sequelize.QueryTypes.SELECT });
                            const producto_regalo = await sequelize.query(`
                            select 
                            *
                            from(
                                select
                                    pd.promdes_sku_gift,
                                    pd.promdes_promocion_descuento_id,
                                    pd.promdes_fecha_inicio_validez, 
                                    pd.promdes_fecha_finalizacion_validez,
                                    pp.prodprom_prod_producto_id,
                                    pd.promdes_tipo_descuento_id 
                                from promociones_descuentos pd
                                left join productos_promociones pp  on pp.prodprom_promdes_promocion_descuento_id  = pd.promdes_promocion_descuento_id 
                                where 
                                    (promdes_tipo_descuento_id = ` + statusControllers.TIPO_PROMOCION['Regalo'] + `)
                                    and
                                        promdes_estatus_id  = `+ statusControllers.ESTATUS_PROMOCION.ACTIVA +`
                                    and
                                    (current_date between  promdes_fecha_inicio_validez and promdes_fecha_finalizacion_validez)
                                    and 
                                        promdes_cupon_descuento  is null
                            )productos
                            where productos.prodprom_prod_producto_id = ` + producto.pcdc_prod_producto_id + `;
                            `, { type: sequelize.QueryTypes.SELECT} );
                            const mejor_descuento = await sequelize.query(`
                            select
                                case 
                                    when max(mejor_descuento.descuento) <= 9 then cast(concat(0, max(mejor_descuento.descuento)) as integer)
                                    else max(mejor_descuento.descuento) 
                                end as mejor_descuento
                            from( 
                                select 
                                    prod_descuento as descuento
                                from productos p 
                                where prod_producto_id  = ` + producto.pcdc_prod_producto_id + `
                                union
                                select 
                                    m.mar_descuento as descuento
                                from productos p2 
                                left join marcas m ON  m.mar_marca_id  = p2.prod_mar_marca_id  
                                where p2.prod_producto_id  = ` + producto.pcdc_prod_producto_id + `
                                union 
                                select 
                                    case 
                                        when sn.sn_descuento >= ldp.listp_descuento then sn.sn_descuento
                                        when ldp.listp_descuento >= sn.sn_descuento then ldp.listp_descuento
                                    end as descuento
                                from socios_negocio sn 
                                left join listas_de_precios ldp on ldp.listp_lista_de_precio_id  = sn.sn_socios_negocio_id 
                                where sn.sn_socios_negocio_id  = ` + socio + `
                            )mejor_descuento;`, { type: sequelize.QueryTypes.SELECT });
                            const descuento_porcentaje_or_monto_fijo = await sequelize.query(`
                            select 
                                *
                            from(
                                select
                                    pd.promdes_tipo_descuento_id,
                                    pd.promdes_promocion_descuento_id,
                                    pd.promdes_descuento_exacto,
                                    pd.promdes_fecha_inicio_validez, 
                                    pd.promdes_fecha_finalizacion_validez,
                                    pp.prodprom_prod_producto_id,
                                    pd.promdes_tipo_descuento_id 
                                from promociones_descuentos pd
                                left join productos_promociones pp  on pp.prodprom_promdes_promocion_descuento_id  = pd.promdes_promocion_descuento_id 
                                where 
                                    (promdes_tipo_descuento_id = ` + statusControllers.TIPO_PROMOCION.Porcentaje + ` or promdes_tipo_descuento_id  = ` + statusControllers.TIPO_PROMOCION['Monto fijo'] + `)
                                    and
                                        promdes_estatus_id  = ` + statusControllers.ESTATUS_PROMOCION.ACTIVA + `
                                    and
                                    (current_date between  promdes_fecha_inicio_validez and promdes_fecha_finalizacion_validez)
                                    and 
                                    promdes_carrito_articulo is true
                                    and 
                                        promdes_cupon_descuento  is null
                            )productos
                            where productos.prodprom_prod_producto_id = ` +  producto.pcdc_prod_producto_id + `
                            `, 
                            {
                                type: sequelize.QueryTypes.SELECT
                            })
                            if(producto.pcdc_cupon_aplicado == false){
                                if(producto_con_promocion.length > 0){
                                    let regalados = await cantidadAgregar(producto.pcdc_producto_cantidad, producto_con_promocion[0].promdes_tipo_descuento_id);
                                    let total = await producto.pcdc_producto_cantidad - regalados;
                                    producto_carrito.update({
                                            pcdc_producto_cantidad: total,
                                            pcdc_prod_producto_id_promocion: producto.pcdc_prod_producto_id,
                                            pcdc_cantidad_producto_promocion: regalados,
                                            pcdc_precio: mejor_precio[0].min,
                                            pcdc_prod_producto_id_regalo: (producto_regalo.length > 0) ? producto_regalo[0].promdes_sku_gift : null,
                                            pcdc_cantidad_producto_regalo: (producto_regalo.length > 0) ? producto.pcdc_producto_cantidad : null,
                                            pcdc_mejor_descuento: (mejor_descuento.length > 0) ?  mejor_descuento[0].mejor_descuento : 0,
                                            pcdc_tipo_prmocion_individual: (descuento_porcentaje_or_monto_fijo.length > 0) ? descuento_porcentaje_or_monto_fijo[0].promdes_tipo_descuento_id : null,
                                            pcdc_descuento_promocion: (descuento_porcentaje_or_monto_fijo.length > 0) ? descuento_porcentaje_or_monto_fijo[0].promdes_descuento_exacto : null

                                    });
                                }else{
                                    producto_carrito.update({
                                        pcdc_precio: mejor_precio[0].min,
                                        pcdc_prod_producto_id_regalo: (producto_regalo.length > 0) ? producto_regalo[0].promdes_sku_gift : null,
                                        pcdc_cantidad_producto_regalo: (producto_regalo.length > 0) ? producto.pcdc_producto_cantidad : null,
                                        pcdc_mejor_descuento: (mejor_descuento.length > 0) ?  mejor_descuento[0].mejor_descuento : 0,
                                        pcdc_tipo_prmocion_individual: (descuento_porcentaje_or_monto_fijo.length > 0) ? descuento_porcentaje_or_monto_fijo[0].promdes_tipo_descuento_id : null,
                                        pcdc_descuento_promocion: (descuento_porcentaje_or_monto_fijo.length > 0) ? descuento_porcentaje_or_monto_fijo[0].promdes_descuento_exacto : null
                                    });
                                }
                            }    
                            if((carrito_de_compra.dataValues.productos_carrito_de_compras.length -1) == indexProducto){
                                //REGRESAMO CARRITO DETALLE
                                const carrito_de_compra =  await models.CarritoDeCompra.findOne({
                                    where: {
                                        cdc_carrito_de_compra_id: carrito_id
                                    }
                                });

                                const productos_carrito_de_compras = await models.ProductoCarritoDeCompra.findAll({
                                    where: {
                                        pcdc_carrito_de_compra_id: carrito_de_compra.dataValues.cdc_carrito_de_compra_id
                                    },
                                    order: [
                                        ['pcdc_prod_producto_id', 'ASC']
                                    ]
                                });

                                productos_carrito_de_compras.forEach(async function(producto, indexProducto){
                                    const almacenes_fisicos = await models.Almacenes.findAll({
                                        where: {
                                            alm_cmm_estatus_id: statusControllers.ESTATUS_ALMACENES.ACTIVA,
                                            alm_tipo_almacen: statusControllers.TIPO_ALMACEN.FISICO
                                        }
                                    });
                                    const producto_carrito = await models.ProductoCarritoDeCompra.findOne({
                                        where:{
                                            pcdc_carrito_de_compra_id: producto.dataValues.pcdc_carrito_de_compra_id,
                                            pcdc_prod_producto_id: producto.dataValues.pcdc_prod_producto_id
                                        }
                                    });
                                    almacenes_fisicos.forEach(async function(almacenFisico, indexAlmacenFisico){
                                        const almacen_origen = await sequelize.query(`
                                        select 
                                            distinct(total_stock.alm_almacen_id) as almacen,
                                            total_stock.fisico as fisico,
                                            case 
                                                when count(distinct(total_stock.fisico)) = 1  then
                                                    sum(total_stock.sp_cantidad)
                                                when count(distinct(total_stock.fisico))  > 1 then
                                                    total_stock.sp_cantidad
                                            end as cantidad,
                                            total_stock.prod_disponible_backorder
                                        from( 
                                            ---Almacen Fisico general tercer
                                            select
                                                distinct (a.alm_almacen_id),
                                                a.alm_almacen_id as fisico,
                                                sp.sp_cantidad,
                                                p.prod_disponible_backorder
                                            from almacenes a 
                                            left join almacenes_logistica al  on al.almlog_almacen_codigo = a."alm_codigoAlmacen" 
                                            left join stocks_productos sp ON sp.sp_almacen_id = a.alm_almacen_id 
                                            left join productos p  on p.prod_producto_id  = sp.sp_prod_producto_id 
                                            where sp.sp_almacen_id = ` + almacenFisico.dataValues.alm_almacen_id + ` and  a.alm_cmm_estatus_id = ` + statusControllers.ESTATUS_ALMACENES.ACTIVA + ` and sp.sp_prod_producto_id  = ` + producto.dataValues.pcdc_prod_producto_id + `
                                            union 
                                            ---Almacen virtual asignado a socio
                                            select
                                                distinct(a.alm_almacen_id),
                                                a2.alm_almacen_id as fisico,
                                                sp.sp_cantidad,
                                                p2.prod_disponible_backorder
                                            from almacenes a 
                                            left join almacenes a2 on a2.alm_almacen_id = a.alm_fisico
                                            left join stocks_productos sp on sp.sp_almacen_id  = a.alm_almacen_id 
                                            left join productos p2 on p2.prod_producto_id  = sp.sp_prod_producto_id 
                                            left join almacenes_logistica al on al.almlog_almacen_codigo = a2."alm_codigoAlmacen" 
                                            where a.alm_almacen_id  = ` + almacen_virtual + ` and a.alm_cmm_estatus_id = ` + statusControllers.ESTATUS_ALMACENES.ACTIVA + ` and sp.sp_prod_producto_id  = ` + producto.dataValues.pcdc_prod_producto_id + `
                                        )total_stock
                                        group by total_stock.fisico, total_stock.sp_cantidad, total_stock.alm_almacen_id, total_stock.prod_disponible_backorder;
                                        `, 
                                        {
                                            type: sequelize.QueryTypes.SELECT
                                        });
                                        console.log('RESULTADO CONSULTA ', almacen_origen, almacen_origen[0].cantidad, producto_carrito.dataValues.pcdc_producto_cantidad)
                                        if(Number(almacen_origen[0].cantidad) > producto_carrito.dataValues.pcdc_producto_cantidad && (producto.dataValues.pcdc_validado == false)){
                                            await producto_carrito.update({
                                                pcdc_almacen_surtido: almacen_origen[0].fisico,
                                                pcdc_validado: true
                                            });
                                        }if((Number(almacen_origen[0].cantidad) < producto_carrito.dataValues.pcdc_producto_cantidad) && (producto.dataValues.pcdc_validado == false)){
                                            if((almacen_origen[0].prod_disponible_backorder) && (producto.dataValues.pcdc_validado == false)){
                                                await producto_carrito.update({
                                                    pcdc_back_order: true,
                                                    pcdc_validado: true
                                                });
                                            }else if(producto.dataValues.pcdc_validado == false){
                                                await producto_carrito.update({
                                                    pcdc_no_disponible_para_compra: true,
                                                    pcdc_producto_cantidad: 0,
                                                    pcdc_validado: true
                                                });
                                            }
                                        }
                                        if((almacenes_fisicos.length -1) == indexAlmacenFisico){
                                            if((productos_carrito_de_compras.length -1) == indexProducto){
                                                
                                                const productos_carrito_de_compras = await models.ProductoCarritoDeCompra.findAll({
                                                    where: {
                                                        pcdc_carrito_de_compra_id: carrito_de_compra.dataValues.cdc_carrito_de_compra_id
                                                    },
                                                    order: [
                                                        ['pcdc_prod_producto_id', 'ASC']
                                                    ],
                                                    attributes: {
                                                        exclude: ['pcdc_validado']
                                                    },
                                                    include: [
                                                        {
                                                            model: models.Producto,
                                                            attributes: {
                                                                exclude: [
                                                                    'prod_usu_usuario_creado_id',
                                                                    'createdAt',
                                                                    'prod_usu_usuario_modificado_id',
                                                                    'updatedAt',
                                                                    'prod_descripcion_corta',
                                                                    'prod_unidad_medida_venta',
                                                                    'prod_altura',
                                                                    'prod_ancho',
                                                                    'prod_longitud',
                                                                    'prod_peso',
                                                                    'prod_volumen',
                                                                    'prod_total_stock',
                                                                    'prod_proveedor_id',
                                                                    'prod_meta_titulo',
                                                                    'prod_meta_descripcion',
                                                                    'prod_is_kit',
                                                                    'prod_viñetas',
                                                                    'prod_calificacion_promedio',
                                                                    'prod_productos_coleccion_relacionados_id',
                                                                    'prod_productos_coleccion_accesorios_id',
                                                                    'prod_video_url'
                                                                ]
                                                            },
                                                            include: [
                                                                {
                                                                    model: models.ImagenProducto,
                                                                    attributes: {
                                                                        exclude: [
                                                                            'imgprod_imagen_producto_id',
                                                                            'imgprod_usu_usuario_creador_id',
                                                                            'createdAt',
                                                                            'updatedAt'
                                                                        ]
                                                                    }
                                                                }
                                                            ]
                                                        }
                                                    ]
                                                });
                                                res.status(200).send({
                                                    message: 'Producto agregado correctamente.',
                                                    carrito_de_compra,
                                                    productos_carrito_de_compras,
                                                    jsonToProject,
                                                    porcentajeDeAprobacion
                                                });  
                                            }
                                        }
                                    });                                                        
                                });      
                            }
                        });
                    }
                }
            }else{
                res.status(300).send({
                    message: 'Carrito de compras no existe o no disponible'
                })
            }
        }catch(e){
            res.status(500).send({
                message: 'Error al agregar producto',
                e
            });
            next(e);
        }
    },
    //Eliminamos producto a carrito (Restructuración)
    deleteProductCarShop: async(req, res, next) =>{
        try{
            let carrito_de_compra = await models.CarritoDeCompra.findOne({
                where: {
                    cdc_carrito_de_compra_id: req.body.pcdc_carrito_de_compra_id
                },
                include: [
                    {
                        model: models.ProductoCarritoDeCompra
                    }
                ]
            });
            if(carrito_de_compra.dataValues.productos_carrito_de_compras.length > 1){
                const listaPrecio = !!carrito_de_compra.cdc_lista_precio ? carrito_de_compra.cdc_lista_precio : 0;
                const socio = !!carrito_de_compra.cdc_sn_socio_de_negocio_id ? carrito_de_compra.cdc_sn_socio_de_negocio_id : 0;
                const carrito_id = !!carrito_de_compra.cdc_carrito_de_compra_id ? carrito_de_compra.cdc_carrito_de_compra_id : 0;
                let socio_negocio = await models.SociosNegocio.findOne({
                    where: {
                        sn_socios_negocio_id: socio
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
                let almacen_virtual  = !!socio_negocio ? socio_negocio.dataValues.sn_almacen_asignado : 0;
                if(!!carrito_de_compra){
                    if(!!carrito_de_compra.dataValues.cdc_descuento_extra || carrito_de_compra.dataValues.cdc_from_project){
                        res.status(300).send({
                            message: 'No es posible eliminar articulos, a un carrito generado por proyecto y/o cotización'
                        });
                    }else{
                        if(!!carrito_de_compra){
                            await models.ProductoCarritoDeCompra.destroy({
                                where: {
                                    pcdc_carrito_de_compra_id : carrito_id,
                                    pcdc_prod_producto_id : req.body.pcdc_prod_producto_id
                                }
                            });
                            const marcas_con_limitantes = await sequelize.query(`
                            select
                                distinct(m.mar_marca_id)
                            from productos_carrito_de_compra pcdc 
                            left join productos p ON p.prod_producto_id  = pcdc.pcdc_prod_producto_id
                            left join marcas m on m.mar_marca_id  = p.prod_mar_marca_id 
                            where 
                                pcdc.pcdc_carrito_de_compra_id  = ` + carrito_id + `
                                and
                                m.mar_propiedades_extras is true
                            `,
                            {
                                type: sequelize.QueryTypes.SELECT    
                            });


                            const productos_de_proyecto = await sequelize.query(`
                            select
                                distinct(pc.pc_prod_producto_id) as producto 
                            from cotizaciones_proyectos cp 
                            inner join productos_cotizaciones pc on pc.pc_cot_cotizacion_id = cp.cot_cotizacion_id
                            where 
                                cp.cot_cmm_estatus_id  = ` + statusControllers.ESTATUS_COTIZACION_PROYECTO.ACTIVO + `
                                and
                                current_date between  current_date and cp.cot_fecha_vencimiento 
                                and 
                                cp.cot_sn_socios_negocio_id  = ` + socio + `;
                            `, {
                                type: sequelize.QueryTypes.SELECT
                            });
                            let idsProyectos = [];
                            
                            if(productos_de_proyecto.length > 0){
                                productos_de_proyecto.forEach(async function(proyecto, indexProyecto){
                                    idsProyectos.push(proyecto.producto);
                                    if((productos_de_proyecto.length -1) == indexProyecto){
                                        let to_ids = await idsProyectos.length > 0 ? idsProyectos : 0 ;
                                        const productos_de_carrito_total = await sequelize.query(`
                                        select
                                            count(distinct(pcdc.pcdc_prod_producto_id)) as incluidos
                                        from carrito_de_compras cdc 
                                        inner join productos_carrito_de_compra pcdc on pcdc.pcdc_carrito_de_compra_id  = cdc.cdc_carrito_de_compra_id 
                                        where 
                                            cdc.cdc_carrito_de_compra_id  = ` + carrito_id + `
                                            and
                                            pcdc.pcdc_prod_producto_id  in (` + to_ids + `);            
                                        `, {
                                            type: sequelize.QueryTypes.SELECT
                                        });
                
                                        const productos_de_carrito = await sequelize.query(`
                                        select
                                            count(distinct(pcdc.pcdc_prod_producto_id)) as total
                                        from carrito_de_compras cdc 
                                        inner join productos_carrito_de_compra pcdc on pcdc.pcdc_carrito_de_compra_id  = cdc.cdc_carrito_de_compra_id 
                                        where 
                                            cdc.cdc_carrito_de_compra_id  = ` + carrito_id + `;            
                                        `, {
                                            type: sequelize.QueryTypes.SELECT
                                        });
                
                                        let porcentajeDeAprobacion = await Number(((Number(productos_de_carrito_total[0].incluidos) / Number(productos_de_carrito[0].total)) * 100).toFixed(2));
                                        let jsonToProject = [];
                                        if(marcas_con_limitantes.length > 0){
                                            marcas_con_limitantes.forEach(async function(marca, indexMarca){
                                                const validacionMarca = await sequelize.query(`
                                                select
                                                    sum(sumatotal.precio_con_descuento) as total,
                                                    sumatotal.marca,
                                                    m.mar_importe,
                                                    case 
                                                        when m.mar_importe  < sum(sumatotal.precio_con_descuento) then true
                                                        when m.mar_importe  > sum(sumatotal.precio_con_descuento) then false
                                                    end as cumple
                                                from(
                                                    select
                                                        descuento.pcdc_producto_cantidad,
                                                        descuento.prod_mar_marca_id as marca,
                                                        case 
                                                            when descuento.pcdc_mejor_descuento >= 10 then  descuento.pcdc_producto_cantidad * (descuento.pcdc_precio -  (descuento.pcdc_precio * cast(concat('0.' || descuento.pcdc_mejor_descuento) as float)))
                                                            when descuento.pcdc_mejor_descuento <= 9 then   descuento.pcdc_producto_cantidad * (descuento.pcdc_precio -  (descuento.pcdc_precio * cast(concat('0.0' || descuento.pcdc_mejor_descuento) as float)))
                                                        end as precio_con_descuento,
                                                        *
                                                    from (
                                                        select 
                                                            *
                                                        from productos_carrito_de_compra pcdc 
                                                        left join productos p  on p.prod_producto_id  = pcdc.pcdc_prod_producto_id
                                                        where 
                                                            pcdc.pcdc_carrito_de_compra_id  = ` + carrito_id + `
                                                            and 
                                                            p.prod_mar_marca_id  = ` + marca.mar_marca_id + `
                                                    )descuento
                                                )sumatotal
                                                left join marcas m on m.mar_marca_id  = sumatotal.marca
                                                group  by sumatotal.marca, m.mar_importe;
                                                `, {
                                                    type: sequelize.QueryTypes.SELECT
                                                });
                                                jsonToProject.push(validacionMarca[0]);
                                                if((marcas_con_limitantes.length -1) == indexMarca){
                                                    const carrito_de_compra =  await models.CarritoDeCompra.findOne({
                                                        where: {
                                                            cdc_carrito_de_compra_id: carrito_id
                                                        },
                                                        include: [
                                                            {
                                                                model: models.ProductoCarritoDeCompra,
                                                                attributes: {
                                                                    exclude: [
                                                                        'pcdc_producto_carrito_id',
                                                                        'createdAt',
                                                                        'updatedAt',
                                                                    ]
                                                                },
                                                                include: [
                                                                    {
                                                                        model: models.Producto,
                                                                        include: [
                                                                            {
                                                                                model: models.ImagenProducto
                                                                            }
                                                                        ]
                                                                    }
                                                                ]
                                                            }
                                                        ]
                                                    });
                                                    carrito_de_compra.dataValues.productos_carrito_de_compras.forEach(async function(producto, indexProducto){
                                                        const producto_carrito = await models.ProductoCarritoDeCompra.findOne({
                                                            where: {
                                                                pcdc_carrito_de_compra_id: producto.pcdc_carrito_de_compra_id,
                                                                pcdc_prod_producto_id: producto.pcdc_prod_producto_id
                                                            }
                                                        });
                                                        
                                                        //Validamos promociones activas
                                                        const producto_con_promocion =  await sequelize.query(`         
                                                        select 
                                                            *
                                                        from(
                                                            select
                                                                pd.promdes_promocion_descuento_id,
                                                                pd.promdes_fecha_inicio_validez, 
                                                                pd.promdes_fecha_finalizacion_validez,
                                                                pp.prodprom_prod_producto_id,
                                                                pd.promdes_tipo_descuento_id 
                                                            from promociones_descuentos pd
                                                            left join productos_promociones pp  on pp.prodprom_promdes_promocion_descuento_id  = pd.promdes_promocion_descuento_id 
                                                            where 
                                                                (promdes_tipo_descuento_id = ` + statusControllers.TIPO_PROMOCION['2 X 1'] + ` or promdes_tipo_descuento_id  = ` + statusControllers.TIPO_PROMOCION['3 X 2'] + `)
                                                                and
                                                                    promdes_estatus_id  = ` + statusControllers.ESTATUS_PROMOCION.ACTIVA + `
                                                                and
                                                                (current_date between  promdes_fecha_inicio_validez and promdes_fecha_finalizacion_validez)
                                                                and 
                                                                    promdes_cupon_descuento  is null
                                                        )productos
                                                        where productos.prodprom_prod_producto_id = ` + producto.pcdc_prod_producto_id + `;`, 
                                                        { type: sequelize.QueryTypes.SELECT });
                                                        const mejor_precio =  await sequelize.query(`         
                                                        select
                                                            case 
                                                                when min(mejor_precio.prod_precio) <= 0 then max(mejor_precio.prod_precio) 
                                                                else
                                                                    min(mejor_precio.prod_precio) 
                                                            end as min
                                                        from (
                                                            select 
                                                                prod_precio
                                                            from productos p 
                                                            where prod_producto_id  = ` + producto.pcdc_prod_producto_id + `
                                                            union 
                                                            select
                                                                pldp.pl_precio_producto 
                                                            from productos_lista_de_precio pldp 
                                                            where pldp.pl_prod_producto_id = ` + producto.pcdc_prod_producto_id + ` and pldp.pl_listp_lista_de_precio_id  = ` + listaPrecio + `
                                                        )mejor_precio;`, 
                                                        { type: sequelize.QueryTypes.SELECT });
                                                        const producto_regalo = await sequelize.query(`
                                                        select 
                                                        *
                                                        from(
                                                            select
                                                                pd.promdes_sku_gift,
                                                                pd.promdes_promocion_descuento_id,
                                                                pd.promdes_fecha_inicio_validez, 
                                                                pd.promdes_fecha_finalizacion_validez,
                                                                pp.prodprom_prod_producto_id,
                                                                pd.promdes_tipo_descuento_id 
                                                            from promociones_descuentos pd
                                                            left join productos_promociones pp  on pp.prodprom_promdes_promocion_descuento_id  = pd.promdes_promocion_descuento_id 
                                                            where 
                                                                (promdes_tipo_descuento_id = ` + statusControllers.TIPO_PROMOCION['Regalo'] + `)
                                                                and
                                                                    promdes_estatus_id  = `+ statusControllers.ESTATUS_PROMOCION.ACTIVA +`
                                                                and
                                                                (current_date between  promdes_fecha_inicio_validez and promdes_fecha_finalizacion_validez)
                                                                and 
                                                                    promdes_cupon_descuento  is null
                                                        )productos
                                                        where productos.prodprom_prod_producto_id = ` + producto.pcdc_prod_producto_id + `;
                                                        `, { type: sequelize.QueryTypes.SELECT} );
                                                        const mejor_descuento = await sequelize.query(`
                                                        select
                                                            case 
                                                                when max(mejor_descuento.descuento) <= 9 then cast(concat(0, max(mejor_descuento.descuento)) as integer)
                                                                else max(mejor_descuento.descuento) 
                                                            end as mejor_descuento
                                                        from( 
                                                            select 
                                                                prod_descuento as descuento
                                                            from productos p 
                                                            where prod_producto_id  = ` + producto.pcdc_prod_producto_id + `
                                                            union
                                                            select 
                                                                m.mar_descuento as descuento
                                                            from productos p2 
                                                            left join marcas m ON  m.mar_marca_id  = p2.prod_mar_marca_id  
                                                            where p2.prod_producto_id  = ` + producto.pcdc_prod_producto_id + `
                                                            union 
                                                            select 
                                                                case 
                                                                    when sn.sn_descuento >= ldp.listp_descuento then sn.sn_descuento
                                                                    when ldp.listp_descuento >= sn.sn_descuento then ldp.listp_descuento
                                                                end as descuento
                                                            from socios_negocio sn 
                                                            left join listas_de_precios ldp on ldp.listp_lista_de_precio_id  = sn.sn_socios_negocio_id 
                                                            where sn.sn_socios_negocio_id  = ` + socio + `
                                                        )mejor_descuento;`, { type: sequelize.QueryTypes.SELECT });
                                                        const descuento_porcentaje_or_monto_fijo = await sequelize.query(`
                                                        select 
                                                            *
                                                        from(
                                                            select
                                                                pd.promdes_tipo_descuento_id,
                                                                pd.promdes_promocion_descuento_id,
                                                                pd.promdes_descuento_exacto,
                                                                pd.promdes_fecha_inicio_validez, 
                                                                pd.promdes_fecha_finalizacion_validez,
                                                                pp.prodprom_prod_producto_id,
                                                                pd.promdes_tipo_descuento_id 
                                                            from promociones_descuentos pd
                                                            left join productos_promociones pp  on pp.prodprom_promdes_promocion_descuento_id  = pd.promdes_promocion_descuento_id 
                                                            where 
                                                                (promdes_tipo_descuento_id = ` + statusControllers.TIPO_PROMOCION.Porcentaje + ` or promdes_tipo_descuento_id  = ` + statusControllers.TIPO_PROMOCION['Monto fijo'] + `)
                                                                and
                                                                    promdes_estatus_id  = ` + statusControllers.ESTATUS_PROMOCION.ACTIVA + `
                                                                and
                                                                (current_date between  promdes_fecha_inicio_validez and promdes_fecha_finalizacion_validez)
                                                                and 
                                                                promdes_carrito_articulo is true
                                                                and 
                                                                    promdes_cupon_descuento  is null
                                                        )productos
                                                        where productos.prodprom_prod_producto_id = ` +  producto.pcdc_prod_producto_id + `
                                                        `, 
                                                        {
                                                            type: sequelize.QueryTypes.SELECT
                                                        });
                                                        if(producto.pcdc_cupon_aplicado == false){
                                                            if(producto_con_promocion.length > 0){
                                                                let regalados = await cantidadAgregar(producto.pcdc_producto_cantidad, producto_con_promocion[0].promdes_tipo_descuento_id);
                                                                let total = await producto.pcdc_producto_cantidad - regalados;
                                                                producto_carrito.update({
                                                                        pcdc_producto_cantidad: total,
                                                                        pcdc_cantidad_producto_promocion: regalados,
                                                                        pcdc_prod_producto_id_promocion: producto.pcdc_prod_producto_id,
                                                                        pcdc_precio: mejor_precio[0].min,
                                                                        pcdc_prod_producto_id_regalo: (producto_regalo.length > 0) ? producto_regalo[0].promdes_sku_gift : null,
                                                                        pcdc_cantidad_producto_regalo: (producto_regalo.length > 0) ? producto.pcdc_producto_cantidad : null,
                                                                        pcdc_mejor_descuento: (mejor_descuento.length > 0) ?  mejor_descuento[0].mejor_descuento : 0,
                                                                        pcdc_tipo_prmocion_individual: (descuento_porcentaje_or_monto_fijo.length > 0) ? descuento_porcentaje_or_monto_fijo[0].promdes_tipo_descuento_id : null,
                                                                        pcdc_descuento_promocion: (descuento_porcentaje_or_monto_fijo.length > 0) ? descuento_porcentaje_or_monto_fijo[0].promdes_descuento_exacto : null
                
                                                                });
                                                            }else{
                                                                producto_carrito.update({
                                                                    pcdc_precio: mejor_precio[0].min,
                                                                    pcdc_prod_producto_id_regalo: (producto_regalo.length > 0) ? producto_regalo[0].promdes_sku_gift : null,
                                                                    pcdc_cantidad_producto_regalo: (producto_regalo.length > 0) ? producto.pcdc_producto_cantidad : null,
                                                                    pcdc_mejor_descuento: (mejor_descuento.length > 0) ?  mejor_descuento[0].mejor_descuento : 0,
                                                                    pcdc_tipo_prmocion_individual: (descuento_porcentaje_or_monto_fijo.length > 0) ? descuento_porcentaje_or_monto_fijo[0].promdes_tipo_descuento_id : null,
                                                                    pcdc_descuento_promocion: (descuento_porcentaje_or_monto_fijo.length > 0) ? descuento_porcentaje_or_monto_fijo[0].promdes_descuento_exacto : null
                                                                });
                                                            }
                                                        }
                                                        if((carrito_de_compra.dataValues.productos_carrito_de_compras.length -1) == indexProducto){
                                                            //REGRESAMO CARRITO DETALLE
                                                            const carrito_de_compra =  await models.CarritoDeCompra.findOne({
                                                                where: {
                                                                    cdc_carrito_de_compra_id: carrito_id
                                                                }
                                                            });
                
                                                            const productos_carrito_de_compras = await models.ProductoCarritoDeCompra.findAll({
                                                                where: {
                                                                    pcdc_carrito_de_compra_id: carrito_de_compra.dataValues.cdc_carrito_de_compra_id
                                                                },
                                                                order: [
                                                                    ['pcdc_prod_producto_id', 'ASC']
                                                                ]
                                                            });

                                                            productos_carrito_de_compras.forEach(async function(producto, indexProducto){
                                                                const almacenes_fisicos = await models.Almacenes.findAll({
                                                                    where: {
                                                                        alm_cmm_estatus_id: statusControllers.ESTATUS_ALMACENES.ACTIVA,
                                                                        alm_tipo_almacen: statusControllers.TIPO_ALMACEN.FISICO
                                                                    }
                                                                });
                                                                const producto_carrito = await models.ProductoCarritoDeCompra.findOne({
                                                                    where:{
                                                                        pcdc_carrito_de_compra_id: producto.dataValues.pcdc_carrito_de_compra_id,
                                                                        pcdc_prod_producto_id: producto.dataValues.pcdc_prod_producto_id
                                                                    }
                                                                });
                                                                almacenes_fisicos.forEach(async function(almacenFisico, indexAlmacenFisico){
                                                                    const almacen_origen = await sequelize.query(`
                                                                    select 
                                                                        distinct(total_stock.alm_almacen_id) as almacen,
                                                                        total_stock.fisico as fisico,
                                                                        case 
                                                                            when count(distinct(total_stock.fisico)) = 1  then
                                                                                sum(total_stock.sp_cantidad)
                                                                            when count(distinct(total_stock.fisico))  > 1 then
                                                                                total_stock.sp_cantidad
                                                                        end as cantidad,
                                                                        total_stock.prod_disponible_backorder
                                                                    from( 
                                                                        ---Almacen Fisico general tercer
                                                                        select
                                                                            distinct (a.alm_almacen_id),
                                                                            a.alm_almacen_id as fisico,
                                                                            sp.sp_cantidad,
                                                                            p.prod_disponible_backorder
                                                                        from almacenes a 
                                                                        left join almacenes_logistica al  on al.almlog_almacen_codigo = a."alm_codigoAlmacen" 
                                                                        left join stocks_productos sp ON sp.sp_almacen_id = a.alm_almacen_id 
                                                                        left join productos p  on p.prod_producto_id  = sp.sp_prod_producto_id 
                                                                        where sp.sp_almacen_id = ` + almacenFisico.dataValues.alm_almacen_id + ` and  a.alm_cmm_estatus_id = ` + statusControllers.ESTATUS_ALMACENES.ACTIVA + ` and sp.sp_prod_producto_id  = ` + producto.dataValues.pcdc_prod_producto_id + `
                                                                        union 
                                                                        ---Almacen virtual asignado a socio
                                                                        select
                                                                            distinct(a.alm_almacen_id),
                                                                            a2.alm_almacen_id as fisico,
                                                                            sp.sp_cantidad,
                                                                            p2.prod_disponible_backorder
                                                                        from almacenes a 
                                                                        left join almacenes a2 on a2.alm_almacen_id = a.alm_fisico
                                                                        left join stocks_productos sp on sp.sp_almacen_id  = a.alm_almacen_id 
                                                                        left join productos p2 on p2.prod_producto_id  = sp.sp_prod_producto_id 
                                                                        left join almacenes_logistica al on al.almlog_almacen_codigo = a2."alm_codigoAlmacen" 
                                                                        where a.alm_almacen_id  = ` + almacen_virtual + ` and a.alm_cmm_estatus_id = ` + statusControllers.ESTATUS_ALMACENES.ACTIVA + ` and sp.sp_prod_producto_id  = ` + producto.dataValues.pcdc_prod_producto_id + `
                                                                    )total_stock
                                                                    group by total_stock.fisico, total_stock.sp_cantidad, total_stock.alm_almacen_id, total_stock.prod_disponible_backorder;
                                                                    `, 
                                                                    {
                                                                        type: sequelize.QueryTypes.SELECT
                                                                    });
                                                                    console.log('RESULTADO CONSULTA ', almacen_origen, almacen_origen[0].cantidad, producto_carrito.dataValues.pcdc_producto_cantidad)
                                                                    if(Number(almacen_origen[0].cantidad) > producto_carrito.dataValues.pcdc_producto_cantidad && (producto.dataValues.pcdc_validado == false)){
                                                                        await producto_carrito.update({
                                                                            pcdc_almacen_surtido: almacen_origen[0].fisico,
                                                                            pcdc_validado: true
                                                                        });
                                                                    }if((Number(almacen_origen[0].cantidad) < producto_carrito.dataValues.pcdc_producto_cantidad) && (producto.dataValues.pcdc_validado == false)){
                                                                        if((almacen_origen[0].prod_disponible_backorder) && (producto.dataValues.pcdc_validado == false)){
                                                                            await producto_carrito.update({
                                                                                pcdc_back_order: true,
                                                                                pcdc_validado: true
                                                                            });
                                                                        }else if(producto.dataValues.pcdc_validado == false){
                                                                            await producto_carrito.update({
                                                                                pcdc_no_disponible_para_compra: true,
                                                                                pcdc_producto_cantidad: 0,
                                                                                pcdc_validado: true
                                                                            });
                                                                        }
                                                                    }
                                                                    if((almacenes_fisicos.length -1) == indexAlmacenFisico){
                                                                        if((productos_carrito_de_compras.length -1) == indexProducto){
                                                                            
                                                                            const productos_carrito_de_compras = await models.ProductoCarritoDeCompra.findAll({
                                                                                where: {
                                                                                    pcdc_carrito_de_compra_id: carrito_de_compra.dataValues.cdc_carrito_de_compra_id
                                                                                },
                                                                                order: [
                                                                                    ['pcdc_prod_producto_id', 'ASC']
                                                                                ],
                                                                                attributes: {
                                                                                    exclude: ['pcdc_validado']
                                                                                },
                                                                                include: [
                                                                                    {
                                                                                        model: models.Producto,
                                                                                        attributes: {
                                                                                            exclude: [
                                                                                                'prod_usu_usuario_creado_id',
                                                                                                'createdAt',
                                                                                                'prod_usu_usuario_modificado_id',
                                                                                                'updatedAt',
                                                                                                'prod_descripcion_corta',
                                                                                                'prod_unidad_medida_venta',
                                                                                                'prod_altura',
                                                                                                'prod_ancho',
                                                                                                'prod_longitud',
                                                                                                'prod_peso',
                                                                                                'prod_volumen',
                                                                                                'prod_total_stock',
                                                                                                'prod_proveedor_id',
                                                                                                'prod_meta_titulo',
                                                                                                'prod_meta_descripcion',
                                                                                                'prod_is_kit',
                                                                                                'prod_viñetas',
                                                                                                'prod_calificacion_promedio',
                                                                                                'prod_productos_coleccion_relacionados_id',
                                                                                                'prod_productos_coleccion_accesorios_id',
                                                                                                'prod_video_url'
                                                                                            ]
                                                                                        },
                                                                                        include: [
                                                                                            {
                                                                                                model: models.ImagenProducto,
                                                                                                attributes: {
                                                                                                    exclude: [
                                                                                                        'imgprod_imagen_producto_id',
                                                                                                        'imgprod_usu_usuario_creador_id',
                                                                                                        'createdAt',
                                                                                                        'updatedAt'
                                                                                                    ]
                                                                                                }
                                                                                            }
                                                                                        ]
                                                                                    }
                                                                                ]
                                                                            });
                                                                            res.status(200).send({
                                                                                message: 'Producto agregado correctamente.',
                                                                                carrito_de_compra,
                                                                                productos_carrito_de_compras,
                                                                                jsonToProject,
                                                                                porcentajeDeAprobacion
                                                                            });  
                                                                        }
                                                                    }
                                                                });                                                        
                                                    });
                                                        }
                                                    });
                                                }
                                            });
                                        }else{
                                            const carrito_de_compra =  await models.CarritoDeCompra.findOne({
                                                where: {
                                                    cdc_carrito_de_compra_id: carrito_id
                                                },
                                                include: [
                                                    {
                                                        model: models.ProductoCarritoDeCompra,
                                                        attributes: {
                                                            exclude: [
                                                                'createdAt',
                                                                'updatedAt',
                                                            ]
                                                        }
                                                    }
                                                ]
                                            });
                                            carrito_de_compra.dataValues.productos_carrito_de_compras.forEach(async function(producto, indexProducto){
                                                const producto_carrito = await models.ProductoCarritoDeCompra.findOne({
                                                    where: {
                                                        pcdc_carrito_de_compra_id: producto.pcdc_carrito_de_compra_id,
                                                        pcdc_prod_producto_id: producto.pcdc_prod_producto_id
                                                    }
                                                });
                                                
                                                //Validamos promociones activas
                                                const producto_con_promocion =  await sequelize.query(`         
                                                select 
                                                    *
                                                from(
                                                    select
                                                        pd.promdes_promocion_descuento_id,
                                                        pd.promdes_fecha_inicio_validez, 
                                                        pd.promdes_fecha_finalizacion_validez,
                                                        pp.prodprom_prod_producto_id,
                                                        pd.promdes_tipo_descuento_id 
                                                    from promociones_descuentos pd
                                                    left join productos_promociones pp  on pp.prodprom_promdes_promocion_descuento_id  = pd.promdes_promocion_descuento_id 
                                                    where 
                                                        (promdes_tipo_descuento_id = ` + statusControllers.TIPO_PROMOCION['2 X 1'] + ` or promdes_tipo_descuento_id  = ` + statusControllers.TIPO_PROMOCION['3 X 2'] + `)
                                                        and
                                                            promdes_estatus_id  = ` + statusControllers.ESTATUS_PROMOCION.ACTIVA + `
                                                        and
                                                        (current_date between  promdes_fecha_inicio_validez and promdes_fecha_finalizacion_validez)
                                                        and 
                                                            promdes_cupon_descuento  is null
                                                )productos
                                                where productos.prodprom_prod_producto_id = ` + producto.pcdc_prod_producto_id + `;`, 
                                                { type: sequelize.QueryTypes.SELECT });
                                                const mejor_precio =  await sequelize.query(`         
                                                select
                                                    case 
                                                        when min(mejor_precio.prod_precio) <= 0 then max(mejor_precio.prod_precio) 
                                                        else
                                                            min(mejor_precio.prod_precio) 
                                                    end as min
                                                from (
                                                    select 
                                                        prod_precio
                                                    from productos p 
                                                    where prod_producto_id  = ` + producto.pcdc_prod_producto_id + `
                                                    union 
                                                    select
                                                        pldp.pl_precio_producto 
                                                    from productos_lista_de_precio pldp 
                                                    where pldp.pl_prod_producto_id = ` + producto.pcdc_prod_producto_id + ` and pldp.pl_listp_lista_de_precio_id  = ` + listaPrecio + `
                                                )mejor_precio;`, 
                                                { type: sequelize.QueryTypes.SELECT });
                                                const producto_regalo = await sequelize.query(`
                                                select 
                                                *
                                                from(
                                                    select
                                                        pd.promdes_sku_gift,
                                                        pd.promdes_promocion_descuento_id,
                                                        pd.promdes_fecha_inicio_validez, 
                                                        pd.promdes_fecha_finalizacion_validez,
                                                        pp.prodprom_prod_producto_id,
                                                        pd.promdes_tipo_descuento_id 
                                                    from promociones_descuentos pd
                                                    left join productos_promociones pp  on pp.prodprom_promdes_promocion_descuento_id  = pd.promdes_promocion_descuento_id 
                                                    where 
                                                        (promdes_tipo_descuento_id = ` + statusControllers.TIPO_PROMOCION['Regalo'] + `)
                                                        and
                                                            promdes_estatus_id  = `+ statusControllers.ESTATUS_PROMOCION.ACTIVA +`
                                                        and
                                                        (current_date between  promdes_fecha_inicio_validez and promdes_fecha_finalizacion_validez)
                                                        and 
                                                            promdes_cupon_descuento  is null
                                                )productos
                                                where productos.prodprom_prod_producto_id = ` + producto.pcdc_prod_producto_id + `;
                                                `, { type: sequelize.QueryTypes.SELECT} );
                                                const mejor_descuento = await sequelize.query(`
                                                select
                                                    case 
                                                        when max(mejor_descuento.descuento) <= 9 then cast(concat(0, max(mejor_descuento.descuento)) as integer)
                                                        else max(mejor_descuento.descuento) 
                                                    end as mejor_descuento
                                                from( 
                                                    select 
                                                        prod_descuento as descuento
                                                    from productos p 
                                                    where prod_producto_id  = ` + producto.pcdc_prod_producto_id + `
                                                    union
                                                    select 
                                                        m.mar_descuento as descuento
                                                    from productos p2 
                                                    left join marcas m ON  m.mar_marca_id  = p2.prod_mar_marca_id  
                                                    where p2.prod_producto_id  = ` + producto.pcdc_prod_producto_id + `
                                                    union 
                                                    select 
                                                        case 
                                                            when sn.sn_descuento >= ldp.listp_descuento then sn.sn_descuento
                                                            when ldp.listp_descuento >= sn.sn_descuento then ldp.listp_descuento
                                                        end as descuento
                                                    from socios_negocio sn 
                                                    left join listas_de_precios ldp on ldp.listp_lista_de_precio_id  = sn.sn_socios_negocio_id 
                                                    where sn.sn_socios_negocio_id  = ` + socio + `
                                                )mejor_descuento;`, { type: sequelize.QueryTypes.SELECT });
                                                const descuento_porcentaje_or_monto_fijo = await sequelize.query(`
                                                select 
                                                    *
                                                from(
                                                    select
                                                        pd.promdes_tipo_descuento_id,
                                                        pd.promdes_promocion_descuento_id,
                                                        pd.promdes_descuento_exacto,
                                                        pd.promdes_fecha_inicio_validez, 
                                                        pd.promdes_fecha_finalizacion_validez,
                                                        pp.prodprom_prod_producto_id,
                                                        pd.promdes_tipo_descuento_id 
                                                    from promociones_descuentos pd
                                                    left join productos_promociones pp  on pp.prodprom_promdes_promocion_descuento_id  = pd.promdes_promocion_descuento_id 
                                                    where 
                                                        (promdes_tipo_descuento_id = ` + statusControllers.TIPO_PROMOCION.Porcentaje + ` or promdes_tipo_descuento_id  = ` + statusControllers.TIPO_PROMOCION['Monto fijo'] + `)
                                                        and
                                                            promdes_estatus_id  = ` + statusControllers.ESTATUS_PROMOCION.ACTIVA + `
                                                        and
                                                        (current_date between  promdes_fecha_inicio_validez and promdes_fecha_finalizacion_validez)
                                                        and 
                                                        promdes_carrito_articulo is true
                                                        and 
                                                            promdes_cupon_descuento  is null
                                                )productos
                                                where productos.prodprom_prod_producto_id = ` +  producto.pcdc_prod_producto_id + `
                                                `, 
                                                {
                                                    type: sequelize.QueryTypes.SELECT
                                                })
                                                if(producto.pcdc_cupon_aplicado == false){
                                                    if(producto_con_promocion.length > 0){
                                                        let regalados = await cantidadAgregar(producto.pcdc_producto_cantidad, producto_con_promocion[0].promdes_tipo_descuento_id);
                                                        let total = await producto.pcdc_producto_cantidad - regalados;
                                                        producto_carrito.update({
                                                                pcdc_producto_cantidad: total,
                                                                pcdc_prod_producto_id_promocion: producto.pcdc_prod_producto_id,
                                                                pcdc_cantidad_producto_promocion: regalados,
                                                                pcdc_precio: mejor_precio[0].min,
                                                                pcdc_prod_producto_id_regalo: (producto_regalo.length > 0) ? producto_regalo[0].promdes_sku_gift : null,
                                                                pcdc_cantidad_producto_regalo: (producto_regalo.length > 0) ? producto.pcdc_producto_cantidad : null,
                                                                pcdc_mejor_descuento: (mejor_descuento.length > 0) ?  mejor_descuento[0].mejor_descuento : 0,
                                                                pcdc_tipo_prmocion_individual: (descuento_porcentaje_or_monto_fijo.length > 0) ? descuento_porcentaje_or_monto_fijo[0].promdes_tipo_descuento_id : null,
                                                                pcdc_descuento_promocion: (descuento_porcentaje_or_monto_fijo.length > 0) ? descuento_porcentaje_or_monto_fijo[0].promdes_descuento_exacto : null
                
                                                        });
                                                    }else{
                                                        producto_carrito.update({
                                                            pcdc_precio: mejor_precio[0].min,
                                                            pcdc_prod_producto_id_regalo: (producto_regalo.length > 0) ? producto_regalo[0].promdes_sku_gift : null,
                                                            pcdc_cantidad_producto_regalo: (producto_regalo.length > 0) ? producto.pcdc_producto_cantidad : null,
                                                            pcdc_mejor_descuento: (mejor_descuento.length > 0) ?  mejor_descuento[0].mejor_descuento : 0,
                                                            pcdc_tipo_prmocion_individual: (descuento_porcentaje_or_monto_fijo.length > 0) ? descuento_porcentaje_or_monto_fijo[0].promdes_tipo_descuento_id : null,
                                                            pcdc_descuento_promocion: (descuento_porcentaje_or_monto_fijo.length > 0) ? descuento_porcentaje_or_monto_fijo[0].promdes_descuento_exacto : null
                                                        });
                                                    }
                                                }    
                                                if((carrito_de_compra.dataValues.productos_carrito_de_compras.length -1) == indexProducto){
                                                    //REGRESAMO CARRITO DETALLE
                                                    const carrito_de_compra =  await models.CarritoDeCompra.findOne({
                                                        where: {
                                                            cdc_carrito_de_compra_id: carrito_id
                                                        }
                                                    });
                
                                                    const productos_carrito_de_compras = await models.ProductoCarritoDeCompra.findAll({
                                                        where: {
                                                            pcdc_carrito_de_compra_id: carrito_de_compra.dataValues.cdc_carrito_de_compra_id
                                                        },
                                                        order: [
                                                            ['pcdc_prod_producto_id', 'ASC']
                                                        ]
                                                    });

                                                    productos_carrito_de_compras.forEach(async function(producto, indexProducto){
                                                        const almacenes_fisicos = await models.Almacenes.findAll({
                                                            where: {
                                                                alm_cmm_estatus_id: statusControllers.ESTATUS_ALMACENES.ACTIVA,
                                                                alm_tipo_almacen: statusControllers.TIPO_ALMACEN.FISICO
                                                            }
                                                        });
                                                        const producto_carrito = await models.ProductoCarritoDeCompra.findOne({
                                                            where:{
                                                                pcdc_carrito_de_compra_id: producto.dataValues.pcdc_carrito_de_compra_id,
                                                                pcdc_prod_producto_id: producto.dataValues.pcdc_prod_producto_id
                                                            }
                                                        });
                                                        almacenes_fisicos.forEach(async function(almacenFisico, indexAlmacenFisico){
                                                            const almacen_origen = await sequelize.query(`
                                                            select 
                                                                distinct(total_stock.alm_almacen_id) as almacen,
                                                                total_stock.fisico as fisico,
                                                                case 
                                                                    when count(distinct(total_stock.fisico)) = 1  then
                                                                        sum(total_stock.sp_cantidad)
                                                                    when count(distinct(total_stock.fisico))  > 1 then
                                                                        total_stock.sp_cantidad
                                                                end as cantidad,
                                                                total_stock.prod_disponible_backorder
                                                            from( 
                                                                ---Almacen Fisico general tercer
                                                                select
                                                                    distinct (a.alm_almacen_id),
                                                                    a.alm_almacen_id as fisico,
                                                                    sp.sp_cantidad,
                                                                    p.prod_disponible_backorder
                                                                from almacenes a 
                                                                left join almacenes_logistica al  on al.almlog_almacen_codigo = a."alm_codigoAlmacen" 
                                                                left join stocks_productos sp ON sp.sp_almacen_id = a.alm_almacen_id 
                                                                left join productos p  on p.prod_producto_id  = sp.sp_prod_producto_id 
                                                                where sp.sp_almacen_id = ` + almacenFisico.dataValues.alm_almacen_id + ` and  a.alm_cmm_estatus_id = ` + statusControllers.ESTATUS_ALMACENES.ACTIVA + ` and sp.sp_prod_producto_id  = ` + producto.dataValues.pcdc_prod_producto_id + `
                                                                union 
                                                                ---Almacen virtual asignado a socio
                                                                select
                                                                    distinct(a.alm_almacen_id),
                                                                    a2.alm_almacen_id as fisico,
                                                                    sp.sp_cantidad,
                                                                    p2.prod_disponible_backorder
                                                                from almacenes a 
                                                                left join almacenes a2 on a2.alm_almacen_id = a.alm_fisico
                                                                left join stocks_productos sp on sp.sp_almacen_id  = a.alm_almacen_id 
                                                                left join productos p2 on p2.prod_producto_id  = sp.sp_prod_producto_id 
                                                                left join almacenes_logistica al on al.almlog_almacen_codigo = a2."alm_codigoAlmacen" 
                                                                where a.alm_almacen_id  = ` + almacen_virtual + ` and a.alm_cmm_estatus_id = ` + statusControllers.ESTATUS_ALMACENES.ACTIVA + ` and sp.sp_prod_producto_id  = ` + producto.dataValues.pcdc_prod_producto_id + `
                                                            )total_stock
                                                            group by total_stock.fisico, total_stock.sp_cantidad, total_stock.alm_almacen_id, total_stock.prod_disponible_backorder;
                                                            `, 
                                                            {
                                                                type: sequelize.QueryTypes.SELECT
                                                            });
                                                            console.log('RESULTADO CONSULTA ', almacen_origen, almacen_origen[0].cantidad, producto_carrito.dataValues.pcdc_producto_cantidad)
                                                            if(Number(almacen_origen[0].cantidad) > producto_carrito.dataValues.pcdc_producto_cantidad && (producto.dataValues.pcdc_validado == false)){
                                                                await producto_carrito.update({
                                                                    pcdc_almacen_surtido: almacen_origen[0].fisico,
                                                                    pcdc_validado: true
                                                                });
                                                            }if((Number(almacen_origen[0].cantidad) < producto_carrito.dataValues.pcdc_producto_cantidad) && (producto.dataValues.pcdc_validado == false)){
                                                                if((almacen_origen[0].prod_disponible_backorder) && (producto.dataValues.pcdc_validado == false)){
                                                                    await producto_carrito.update({
                                                                        pcdc_back_order: true,
                                                                        pcdc_validado: true
                                                                    });
                                                                }else if(producto.dataValues.pcdc_validado == false){
                                                                    await producto_carrito.update({
                                                                        pcdc_no_disponible_para_compra: true,
                                                                        pcdc_producto_cantidad: 0,
                                                                        pcdc_validado: true
                                                                    });
                                                                }
                                                            }
                                                            if((almacenes_fisicos.length -1) == indexAlmacenFisico){
                                                                if((productos_carrito_de_compras.length -1) == indexProducto){
                                                                    
                                                                    const productos_carrito_de_compras = await models.ProductoCarritoDeCompra.findAll({
                                                                        where: {
                                                                            pcdc_carrito_de_compra_id: carrito_de_compra.dataValues.cdc_carrito_de_compra_id
                                                                        },
                                                                        order: [
                                                                            ['pcdc_prod_producto_id', 'ASC']
                                                                        ],
                                                                        attributes: {
                                                                            exclude: ['pcdc_validado']
                                                                        },
                                                                        include: [
                                                                            {
                                                                                model: models.Producto,
                                                                                attributes: {
                                                                                    exclude: [
                                                                                        'prod_usu_usuario_creado_id',
                                                                                        'createdAt',
                                                                                        'prod_usu_usuario_modificado_id',
                                                                                        'updatedAt',
                                                                                        'prod_descripcion_corta',
                                                                                        'prod_unidad_medida_venta',
                                                                                        'prod_altura',
                                                                                        'prod_ancho',
                                                                                        'prod_longitud',
                                                                                        'prod_peso',
                                                                                        'prod_volumen',
                                                                                        'prod_total_stock',
                                                                                        'prod_proveedor_id',
                                                                                        'prod_meta_titulo',
                                                                                        'prod_meta_descripcion',
                                                                                        'prod_is_kit',
                                                                                        'prod_viñetas',
                                                                                        'prod_calificacion_promedio',
                                                                                        'prod_productos_coleccion_relacionados_id',
                                                                                        'prod_productos_coleccion_accesorios_id',
                                                                                        'prod_video_url'
                                                                                    ]
                                                                                },
                                                                                include: [
                                                                                    {
                                                                                        model: models.ImagenProducto,
                                                                                        attributes: {
                                                                                            exclude: [
                                                                                                'imgprod_imagen_producto_id',
                                                                                                'imgprod_usu_usuario_creador_id',
                                                                                                'createdAt',
                                                                                                'updatedAt'
                                                                                            ]
                                                                                        }
                                                                                    }
                                                                                ]
                                                                            }
                                                                        ]
                                                                    });
                                                                    res.status(200).send({
                                                                        message: 'Producto agregado correctamente.',
                                                                        carrito_de_compra,
                                                                        productos_carrito_de_compras,
                                                                        jsonToProject,
                                                                        porcentajeDeAprobacion
                                                                    });  
                                                                }
                                                            }
                                                        });                                                        
                                                    });
                                                }
                                            });
                
                                        }
                                    }
                                });
                            }else{
                                let to_ids = await idsProyectos.length > 0 ? idsProyectos : 0 ;
                                const productos_de_carrito_total = await sequelize.query(`
                                select
                                    count(distinct(pcdc.pcdc_prod_producto_id)) as incluidos
                                from carrito_de_compras cdc 
                                inner join productos_carrito_de_compra pcdc on pcdc.pcdc_carrito_de_compra_id  = cdc.cdc_carrito_de_compra_id 
                                where 
                                    cdc.cdc_carrito_de_compra_id  = ` + carrito_id + `
                                    and
                                    pcdc.pcdc_prod_producto_id  in (` + to_ids + `);            
                                `, {
                                    type: sequelize.QueryTypes.SELECT
                                });

                                const productos_de_carrito = await sequelize.query(`
                                select
                                    count(distinct(pcdc.pcdc_prod_producto_id)) as total
                                from carrito_de_compras cdc 
                                inner join productos_carrito_de_compra pcdc on pcdc.pcdc_carrito_de_compra_id  = cdc.cdc_carrito_de_compra_id 
                                where 
                                    cdc.cdc_carrito_de_compra_id  = ` + carrito_id + `;            
                                `, {
                                    type: sequelize.QueryTypes.SELECT
                                });

                                let porcentajeDeAprobacion = await Number(((Number(productos_de_carrito_total[0].incluidos) / Number(productos_de_carrito[0].total)) * 100).toFixed(2));
                                let jsonToProject = [];
                                if(marcas_con_limitantes.length > 0){
                                    marcas_con_limitantes.forEach(async function(marca, indexMarca){
                                        const validacionMarca = await sequelize.query(`
                                        select
                                            sum(sumatotal.precio_con_descuento) as total,
                                            sumatotal.marca,
                                            m.mar_importe,
                                            case 
                                                when m.mar_importe  < sum(sumatotal.precio_con_descuento) then true
                                                when m.mar_importe  > sum(sumatotal.precio_con_descuento) then false
                                            end as cumple
                                        from(
                                            select
                                                descuento.pcdc_producto_cantidad,
                                                descuento.prod_mar_marca_id as marca,
                                                case 
                                                    when descuento.pcdc_mejor_descuento >= 10 then  descuento.pcdc_producto_cantidad * (descuento.pcdc_precio -  (descuento.pcdc_precio * cast(concat('0.' || descuento.pcdc_mejor_descuento) as float)))
                                                    when descuento.pcdc_mejor_descuento <= 9 then   descuento.pcdc_producto_cantidad * (descuento.pcdc_precio -  (descuento.pcdc_precio * cast(concat('0.0' || descuento.pcdc_mejor_descuento) as float)))
                                                end as precio_con_descuento,
                                                *
                                            from (
                                                select 
                                                    *
                                                from productos_carrito_de_compra pcdc 
                                                left join productos p  on p.prod_producto_id  = pcdc.pcdc_prod_producto_id
                                                where 
                                                    pcdc.pcdc_carrito_de_compra_id  = ` + carrito_id + `
                                                    and 
                                                    p.prod_mar_marca_id  = ` + marca.mar_marca_id + `
                                            )descuento
                                        )sumatotal
                                        left join marcas m on m.mar_marca_id  = sumatotal.marca
                                        group  by sumatotal.marca, m.mar_importe;
                                        `, {
                                            type: sequelize.QueryTypes.SELECT
                                        });
                                        jsonToProject.push(validacionMarca[0]);
                                        if((marcas_con_limitantes.length -1) == indexMarca){
                                            const carrito_de_compra =  await models.CarritoDeCompra.findOne({
                                                where: {
                                                    cdc_carrito_de_compra_id: carrito_id
                                                },
                                                include: [
                                                    {
                                                        model: models.ProductoCarritoDeCompra,
                                                        attributes: {
                                                            exclude: [
                                                                'createdAt',
                                                                'updatedAt',
                                                            ]
                                                        }
                                                    }
                                                ]
                                            });
                                            carrito_de_compra.dataValues.productos_carrito_de_compras.forEach(async function(producto, indexProducto){
                                                const producto_carrito = await models.ProductoCarritoDeCompra.findOne({
                                                    where: {
                                                        pcdc_carrito_de_compra_id: producto.pcdc_carrito_de_compra_id,
                                                        pcdc_prod_producto_id: producto.pcdc_prod_producto_id
                                                    }
                                                });
                                                
                                                //Validamos promociones activas
                                                const producto_con_promocion =  await sequelize.query(`         
                                                select 
                                                    *
                                                from(
                                                    select
                                                        pd.promdes_promocion_descuento_id,
                                                        pd.promdes_fecha_inicio_validez, 
                                                        pd.promdes_fecha_finalizacion_validez,
                                                        pp.prodprom_prod_producto_id,
                                                        pd.promdes_tipo_descuento_id 
                                                    from promociones_descuentos pd
                                                    left join productos_promociones pp  on pp.prodprom_promdes_promocion_descuento_id  = pd.promdes_promocion_descuento_id 
                                                    where 
                                                        (promdes_tipo_descuento_id = ` + statusControllers.TIPO_PROMOCION['2 X 1'] + ` or promdes_tipo_descuento_id  = ` + statusControllers.TIPO_PROMOCION['3 X 2'] + `)
                                                        and
                                                            promdes_estatus_id  = ` + statusControllers.ESTATUS_PROMOCION.ACTIVA + `
                                                        and
                                                        (current_date between  promdes_fecha_inicio_validez and promdes_fecha_finalizacion_validez)
                                                        and 
                                                            promdes_cupon_descuento  is null
                                                )productos
                                                where productos.prodprom_prod_producto_id = ` + producto.pcdc_prod_producto_id + `;`, 
                                                { type: sequelize.QueryTypes.SELECT });
                                                const mejor_precio =  await sequelize.query(`         
                                                select
                                                    case 
                                                        when min(mejor_precio.prod_precio) <= 0 then max(mejor_precio.prod_precio) 
                                                        else
                                                            min(mejor_precio.prod_precio) 
                                                    end as min
                                                from (
                                                    select 
                                                        prod_precio
                                                    from productos p 
                                                    where prod_producto_id  = ` + producto.pcdc_prod_producto_id + `
                                                    union 
                                                    select
                                                        pldp.pl_precio_producto 
                                                    from productos_lista_de_precio pldp 
                                                    where pldp.pl_prod_producto_id = ` + producto.pcdc_prod_producto_id + ` and pldp.pl_listp_lista_de_precio_id  = ` + listaPrecio + `
                                                )mejor_precio;`, 
                                                { type: sequelize.QueryTypes.SELECT });
                                                const producto_regalo = await sequelize.query(`
                                                select 
                                                *
                                                from(
                                                    select
                                                        pd.promdes_sku_gift,
                                                        pd.promdes_promocion_descuento_id,
                                                        pd.promdes_fecha_inicio_validez, 
                                                        pd.promdes_fecha_finalizacion_validez,
                                                        pp.prodprom_prod_producto_id,
                                                        pd.promdes_tipo_descuento_id 
                                                    from promociones_descuentos pd
                                                    left join productos_promociones pp  on pp.prodprom_promdes_promocion_descuento_id  = pd.promdes_promocion_descuento_id 
                                                    where 
                                                        (promdes_tipo_descuento_id = ` + statusControllers.TIPO_PROMOCION['Regalo'] + `)
                                                        and
                                                            promdes_estatus_id  = `+ statusControllers.ESTATUS_PROMOCION.ACTIVA +`
                                                        and
                                                        (current_date between  promdes_fecha_inicio_validez and promdes_fecha_finalizacion_validez)
                                                        and 
                                                            promdes_cupon_descuento  is null
                                                )productos
                                                where productos.prodprom_prod_producto_id = ` + producto.pcdc_prod_producto_id + `;
                                                `, { type: sequelize.QueryTypes.SELECT} );
                                                const mejor_descuento = await sequelize.query(`
                                                select
                                                    case 
                                                        when max(mejor_descuento.descuento) <= 9 then cast(concat(0, max(mejor_descuento.descuento)) as integer)
                                                        else max(mejor_descuento.descuento) 
                                                    end as mejor_descuento
                                                from( 
                                                    select 
                                                        prod_descuento as descuento
                                                    from productos p 
                                                    where prod_producto_id  = ` + producto.pcdc_prod_producto_id + `
                                                    union
                                                    select 
                                                        m.mar_descuento as descuento
                                                    from productos p2 
                                                    left join marcas m ON  m.mar_marca_id  = p2.prod_mar_marca_id  
                                                    where p2.prod_producto_id  = ` + producto.pcdc_prod_producto_id + `
                                                    union 
                                                    select 
                                                        case 
                                                            when sn.sn_descuento >= ldp.listp_descuento then sn.sn_descuento
                                                            when ldp.listp_descuento >= sn.sn_descuento then ldp.listp_descuento
                                                        end as descuento
                                                    from socios_negocio sn 
                                                    left join listas_de_precios ldp on ldp.listp_lista_de_precio_id  = sn.sn_socios_negocio_id 
                                                    where sn.sn_socios_negocio_id  = ` + socio + `
                                                )mejor_descuento;`, { type: sequelize.QueryTypes.SELECT });
                                                const descuento_porcentaje_or_monto_fijo = await sequelize.query(`
                                                select 
                                                    *
                                                from(
                                                    select
                                                        pd.promdes_tipo_descuento_id,
                                                        pd.promdes_promocion_descuento_id,
                                                        pd.promdes_descuento_exacto,
                                                        pd.promdes_fecha_inicio_validez, 
                                                        pd.promdes_fecha_finalizacion_validez,
                                                        pp.prodprom_prod_producto_id,
                                                        pd.promdes_tipo_descuento_id 
                                                    from promociones_descuentos pd
                                                    left join productos_promociones pp  on pp.prodprom_promdes_promocion_descuento_id  = pd.promdes_promocion_descuento_id 
                                                    where 
                                                        (promdes_tipo_descuento_id = ` + statusControllers.TIPO_PROMOCION.Porcentaje + ` or promdes_tipo_descuento_id  = ` + statusControllers.TIPO_PROMOCION['Monto fijo'] + `)
                                                        and
                                                            promdes_estatus_id  = ` + statusControllers.ESTATUS_PROMOCION.ACTIVA + `
                                                        and
                                                        (current_date between  promdes_fecha_inicio_validez and promdes_fecha_finalizacion_validez)
                                                        and 
                                                        promdes_carrito_articulo is true
                                                        and 
                                                            promdes_cupon_descuento  is null
                                                )productos
                                                where productos.prodprom_prod_producto_id = ` +  producto.pcdc_prod_producto_id + `
                                                `, 
                                                {
                                                    type: sequelize.QueryTypes.SELECT
                                                });
                                                if(producto.pcdc_cupon_aplicado == false){
                                                    if(producto_con_promocion.length > 0){
                                                        let regalados = await cantidadAgregar(producto.pcdc_producto_cantidad, producto_con_promocion[0].promdes_tipo_descuento_id);
                                                        let total = await producto.pcdc_producto_cantidad - regalados;
                                                        producto_carrito.update({
                                                                pcdc_producto_cantidad: total,
                                                                pcdc_cantidad_producto_promocion: regalados,
                                                                pcdc_prod_producto_id_promocion: producto.pcdc_prod_producto_id,
                                                                pcdc_precio: mejor_precio[0].min,
                                                                pcdc_prod_producto_id_regalo: (producto_regalo.length > 0) ? producto_regalo[0].promdes_sku_gift : null,
                                                                pcdc_cantidad_producto_regalo: (producto_regalo.length > 0) ? producto.pcdc_producto_cantidad : null,
                                                                pcdc_mejor_descuento: (mejor_descuento.length > 0) ?  mejor_descuento[0].mejor_descuento : 0,
                                                                pcdc_tipo_prmocion_individual: (descuento_porcentaje_or_monto_fijo.length > 0) ? descuento_porcentaje_or_monto_fijo[0].promdes_tipo_descuento_id : null,
                                                                pcdc_descuento_promocion: (descuento_porcentaje_or_monto_fijo.length > 0) ? descuento_porcentaje_or_monto_fijo[0].promdes_descuento_exacto : null

                                                        });
                                                    }else{
                                                        producto_carrito.update({
                                                            pcdc_precio: mejor_precio[0].min,
                                                            pcdc_prod_producto_id_regalo: (producto_regalo.length > 0) ? producto_regalo[0].promdes_sku_gift : null,
                                                            pcdc_cantidad_producto_regalo: (producto_regalo.length > 0) ? producto.pcdc_producto_cantidad : null,
                                                            pcdc_mejor_descuento: (mejor_descuento.length > 0) ?  mejor_descuento[0].mejor_descuento : 0,
                                                            pcdc_tipo_prmocion_individual: (descuento_porcentaje_or_monto_fijo.length > 0) ? descuento_porcentaje_or_monto_fijo[0].promdes_tipo_descuento_id : null,
                                                            pcdc_descuento_promocion: (descuento_porcentaje_or_monto_fijo.length > 0) ? descuento_porcentaje_or_monto_fijo[0].promdes_descuento_exacto : null
                                                        });
                                                    }
                                                }
                                                if((carrito_de_compra.dataValues.productos_carrito_de_compras.length -1) == indexProducto){
                                                    //REGRESAMO CARRITO DETALLE
                                                    const carrito_de_compra =  await models.CarritoDeCompra.findOne({
                                                        where: {
                                                            cdc_carrito_de_compra_id: carrito_id
                                                        }
                                                    });
                
                                                    const productos_carrito_de_compras = await models.ProductoCarritoDeCompra.findAll({
                                                        where: {
                                                            pcdc_carrito_de_compra_id: carrito_de_compra.dataValues.cdc_carrito_de_compra_id
                                                        },
                                                        order: [
                                                            ['pcdc_prod_producto_id', 'ASC']
                                                        ]
                                                    });

                                                    productos_carrito_de_compras.forEach(async function(producto, indexProducto){
                                                        const almacenes_fisicos = await models.Almacenes.findAll({
                                                            where: {
                                                                alm_cmm_estatus_id: statusControllers.ESTATUS_ALMACENES.ACTIVA,
                                                                alm_tipo_almacen: statusControllers.TIPO_ALMACEN.FISICO
                                                            }
                                                        });
                                                        const producto_carrito = await models.ProductoCarritoDeCompra.findOne({
                                                            where:{
                                                                pcdc_carrito_de_compra_id: producto.dataValues.pcdc_carrito_de_compra_id,
                                                                pcdc_prod_producto_id: producto.dataValues.pcdc_prod_producto_id
                                                            }
                                                        });
                                                        almacenes_fisicos.forEach(async function(almacenFisico, indexAlmacenFisico){
                                                            const almacen_origen = await sequelize.query(`
                                                            select 
                                                                distinct(total_stock.alm_almacen_id) as almacen,
                                                                total_stock.fisico as fisico,
                                                                case 
                                                                    when count(distinct(total_stock.fisico)) = 1  then
                                                                        sum(total_stock.sp_cantidad)
                                                                    when count(distinct(total_stock.fisico))  > 1 then
                                                                        total_stock.sp_cantidad
                                                                end as cantidad,
                                                                total_stock.prod_disponible_backorder
                                                            from( 
                                                                ---Almacen Fisico general tercer
                                                                select
                                                                    distinct (a.alm_almacen_id),
                                                                    a.alm_almacen_id as fisico,
                                                                    sp.sp_cantidad,
                                                                    p.prod_disponible_backorder
                                                                from almacenes a 
                                                                left join almacenes_logistica al  on al.almlog_almacen_codigo = a."alm_codigoAlmacen" 
                                                                left join stocks_productos sp ON sp.sp_almacen_id = a.alm_almacen_id 
                                                                left join productos p  on p.prod_producto_id  = sp.sp_prod_producto_id 
                                                                where sp.sp_almacen_id = ` + almacenFisico.dataValues.alm_almacen_id + ` and  a.alm_cmm_estatus_id = ` + statusControllers.ESTATUS_ALMACENES.ACTIVA + ` and sp.sp_prod_producto_id  = ` + producto.dataValues.pcdc_prod_producto_id + `
                                                                union 
                                                                ---Almacen virtual asignado a socio
                                                                select
                                                                    distinct(a.alm_almacen_id),
                                                                    a2.alm_almacen_id as fisico,
                                                                    sp.sp_cantidad,
                                                                    p2.prod_disponible_backorder
                                                                from almacenes a 
                                                                left join almacenes a2 on a2.alm_almacen_id = a.alm_fisico
                                                                left join stocks_productos sp on sp.sp_almacen_id  = a.alm_almacen_id 
                                                                left join productos p2 on p2.prod_producto_id  = sp.sp_prod_producto_id 
                                                                left join almacenes_logistica al on al.almlog_almacen_codigo = a2."alm_codigoAlmacen" 
                                                                where a.alm_almacen_id  = ` + almacen_virtual + ` and a.alm_cmm_estatus_id = ` + statusControllers.ESTATUS_ALMACENES.ACTIVA + ` and sp.sp_prod_producto_id  = ` + producto.dataValues.pcdc_prod_producto_id + `
                                                            )total_stock
                                                            group by total_stock.fisico, total_stock.sp_cantidad, total_stock.alm_almacen_id, total_stock.prod_disponible_backorder;
                                                            `, 
                                                            {
                                                                type: sequelize.QueryTypes.SELECT
                                                            });
                                                            console.log('RESULTADO CONSULTA ', almacen_origen, almacen_origen[0].cantidad, producto_carrito.dataValues.pcdc_producto_cantidad)
                                                            if(Number(almacen_origen[0].cantidad) > producto_carrito.dataValues.pcdc_producto_cantidad && (producto.dataValues.pcdc_validado == false)){
                                                                await producto_carrito.update({
                                                                    pcdc_almacen_surtido: almacen_origen[0].fisico,
                                                                    pcdc_validado: true
                                                                });
                                                            }if((Number(almacen_origen[0].cantidad) < producto_carrito.dataValues.pcdc_producto_cantidad) && (producto.dataValues.pcdc_validado == false)){
                                                                if((almacen_origen[0].prod_disponible_backorder) && (producto.dataValues.pcdc_validado == false)){
                                                                    await producto_carrito.update({
                                                                        pcdc_back_order: true,
                                                                        pcdc_validado: true
                                                                    });
                                                                }else if(producto.dataValues.pcdc_validado == false){
                                                                    await producto_carrito.update({
                                                                        pcdc_no_disponible_para_compra: true,
                                                                        pcdc_producto_cantidad: 0,
                                                                        pcdc_validado: true
                                                                    });
                                                                }
                                                            }
                                                            if((almacenes_fisicos.length -1) == indexAlmacenFisico){
                                                                if((productos_carrito_de_compras.length -1) == indexProducto){
                                                                    
                                                                    const productos_carrito_de_compras = await models.ProductoCarritoDeCompra.findAll({
                                                                        where: {
                                                                            pcdc_carrito_de_compra_id: carrito_de_compra.dataValues.cdc_carrito_de_compra_id
                                                                        },
                                                                        order: [
                                                                            ['pcdc_prod_producto_id', 'ASC']
                                                                        ],
                                                                        attributes: {
                                                                            exclude: ['pcdc_validado']
                                                                        },
                                                                        include: [
                                                                            {
                                                                                model: models.Producto,
                                                                                attributes: {
                                                                                    exclude: [
                                                                                        'prod_usu_usuario_creado_id',
                                                                                        'createdAt',
                                                                                        'prod_usu_usuario_modificado_id',
                                                                                        'updatedAt',
                                                                                        'prod_descripcion_corta',
                                                                                        'prod_unidad_medida_venta',
                                                                                        'prod_altura',
                                                                                        'prod_ancho',
                                                                                        'prod_longitud',
                                                                                        'prod_peso',
                                                                                        'prod_volumen',
                                                                                        'prod_total_stock',
                                                                                        'prod_proveedor_id',
                                                                                        'prod_meta_titulo',
                                                                                        'prod_meta_descripcion',
                                                                                        'prod_is_kit',
                                                                                        'prod_viñetas',
                                                                                        'prod_calificacion_promedio',
                                                                                        'prod_productos_coleccion_relacionados_id',
                                                                                        'prod_productos_coleccion_accesorios_id',
                                                                                        'prod_video_url'
                                                                                    ]
                                                                                },
                                                                                include: [
                                                                                    {
                                                                                        model: models.ImagenProducto,
                                                                                        attributes: {
                                                                                            exclude: [
                                                                                                'imgprod_imagen_producto_id',
                                                                                                'imgprod_usu_usuario_creador_id',
                                                                                                'createdAt',
                                                                                                'updatedAt'
                                                                                            ]
                                                                                        }
                                                                                    }
                                                                                ]
                                                                            }
                                                                        ]
                                                                    });
                                                                    res.status(200).send({
                                                                        message: 'Producto agregado correctamente.',
                                                                        carrito_de_compra,
                                                                        productos_carrito_de_compras,
                                                                        jsonToProject,
                                                                        porcentajeDeAprobacion
                                                                    });  
                                                                }
                                                            }
                                                        });                                                        
                                                    });
                                                }
                                            });
                                        }
                                    });
                                }else{
                                    const carrito_de_compra =  await models.CarritoDeCompra.findOne({
                                        where: {
                                            cdc_carrito_de_compra_id: carrito_id
                                        },
                                        include: [
                                            {
                                                model: models.ProductoCarritoDeCompra,
                                                attributes: {
                                                    exclude: [
                                                        'createdAt',
                                                        'updatedAt',
                                                    ]
                                                }
                                            }
                                        ]
                                    });
                                    carrito_de_compra.dataValues.productos_carrito_de_compras.forEach(async function(producto, indexProducto){
                                        const producto_carrito = await models.ProductoCarritoDeCompra.findOne({
                                            where: {
                                                pcdc_carrito_de_compra_id: producto.pcdc_carrito_de_compra_id,
                                                pcdc_prod_producto_id: producto.pcdc_prod_producto_id
                                            }
                                        });
                                        
                                        //Validamos promociones activas
                                        const producto_con_promocion =  await sequelize.query(`         
                                        select 
                                            *
                                        from(
                                            select
                                                pd.promdes_promocion_descuento_id,
                                                pd.promdes_fecha_inicio_validez, 
                                                pd.promdes_fecha_finalizacion_validez,
                                                pp.prodprom_prod_producto_id,
                                                pd.promdes_tipo_descuento_id 
                                            from promociones_descuentos pd
                                            left join productos_promociones pp  on pp.prodprom_promdes_promocion_descuento_id  = pd.promdes_promocion_descuento_id 
                                            where 
                                                (promdes_tipo_descuento_id = ` + statusControllers.TIPO_PROMOCION['2 X 1'] + ` or promdes_tipo_descuento_id  = ` + statusControllers.TIPO_PROMOCION['3 X 2'] + `)
                                                and
                                                    promdes_estatus_id  = ` + statusControllers.ESTATUS_PROMOCION.ACTIVA + `
                                                and
                                                (current_date between  promdes_fecha_inicio_validez and promdes_fecha_finalizacion_validez)
                                                and 
                                                    promdes_cupon_descuento  is null
                                        )productos
                                        where productos.prodprom_prod_producto_id = ` + producto.pcdc_prod_producto_id + `;`, 
                                        { type: sequelize.QueryTypes.SELECT });
                                        const mejor_precio =  await sequelize.query(`         
                                        select
                                            case 
                                                when min(mejor_precio.prod_precio) <= 0 then max(mejor_precio.prod_precio) 
                                                else
                                                    min(mejor_precio.prod_precio) 
                                            end as min
                                        from (
                                            select 
                                                prod_precio
                                            from productos p 
                                            where prod_producto_id  = ` + producto.pcdc_prod_producto_id + `
                                            union 
                                            select
                                                pldp.pl_precio_producto 
                                            from productos_lista_de_precio pldp 
                                            where pldp.pl_prod_producto_id = ` + producto.pcdc_prod_producto_id + ` and pldp.pl_listp_lista_de_precio_id  = ` + listaPrecio + `
                                        )mejor_precio;`, 
                                        { type: sequelize.QueryTypes.SELECT });
                                        const producto_regalo = await sequelize.query(`
                                        select 
                                        *
                                        from(
                                            select
                                                pd.promdes_sku_gift,
                                                pd.promdes_promocion_descuento_id,
                                                pd.promdes_fecha_inicio_validez, 
                                                pd.promdes_fecha_finalizacion_validez,
                                                pp.prodprom_prod_producto_id,
                                                pd.promdes_tipo_descuento_id 
                                            from promociones_descuentos pd
                                            left join productos_promociones pp  on pp.prodprom_promdes_promocion_descuento_id  = pd.promdes_promocion_descuento_id 
                                            where 
                                                (promdes_tipo_descuento_id = ` + statusControllers.TIPO_PROMOCION['Regalo'] + `)
                                                and
                                                    promdes_estatus_id  = `+ statusControllers.ESTATUS_PROMOCION.ACTIVA +`
                                                and
                                                (current_date between  promdes_fecha_inicio_validez and promdes_fecha_finalizacion_validez)
                                                and 
                                                    promdes_cupon_descuento  is null
                                        )productos
                                        where productos.prodprom_prod_producto_id = ` + producto.pcdc_prod_producto_id + `;
                                        `, { type: sequelize.QueryTypes.SELECT} );
                                        const mejor_descuento = await sequelize.query(`
                                        select
                                            case 
                                                when max(mejor_descuento.descuento) <= 9 then cast(concat(0, max(mejor_descuento.descuento)) as integer)
                                                else max(mejor_descuento.descuento) 
                                            end as mejor_descuento
                                        from( 
                                            select 
                                                prod_descuento as descuento
                                            from productos p 
                                            where prod_producto_id  = ` + producto.pcdc_prod_producto_id + `
                                            union
                                            select 
                                                m.mar_descuento as descuento
                                            from productos p2 
                                            left join marcas m ON  m.mar_marca_id  = p2.prod_mar_marca_id  
                                            where p2.prod_producto_id  = ` + producto.pcdc_prod_producto_id + `
                                            union 
                                            select 
                                                case 
                                                    when sn.sn_descuento >= ldp.listp_descuento then sn.sn_descuento
                                                    when ldp.listp_descuento >= sn.sn_descuento then ldp.listp_descuento
                                                end as descuento
                                            from socios_negocio sn 
                                            left join listas_de_precios ldp on ldp.listp_lista_de_precio_id  = sn.sn_socios_negocio_id 
                                            where sn.sn_socios_negocio_id  = ` + socio + `
                                        )mejor_descuento;`, { type: sequelize.QueryTypes.SELECT });
                                        const descuento_porcentaje_or_monto_fijo = await sequelize.query(`
                                        select 
                                            *
                                        from(
                                            select
                                                pd.promdes_tipo_descuento_id,
                                                pd.promdes_promocion_descuento_id,
                                                pd.promdes_descuento_exacto,
                                                pd.promdes_fecha_inicio_validez, 
                                                pd.promdes_fecha_finalizacion_validez,
                                                pp.prodprom_prod_producto_id,
                                                pd.promdes_tipo_descuento_id 
                                            from promociones_descuentos pd
                                            left join productos_promociones pp  on pp.prodprom_promdes_promocion_descuento_id  = pd.promdes_promocion_descuento_id 
                                            where 
                                                (promdes_tipo_descuento_id = ` + statusControllers.TIPO_PROMOCION.Porcentaje + ` or promdes_tipo_descuento_id  = ` + statusControllers.TIPO_PROMOCION['Monto fijo'] + `)
                                                and
                                                    promdes_estatus_id  = ` + statusControllers.ESTATUS_PROMOCION.ACTIVA + `
                                                and
                                                (current_date between  promdes_fecha_inicio_validez and promdes_fecha_finalizacion_validez)
                                                and 
                                                promdes_carrito_articulo is true
                                                and 
                                                    promdes_cupon_descuento  is null
                                        )productos
                                        where productos.prodprom_prod_producto_id = ` +  producto.pcdc_prod_producto_id + `
                                        `, 
                                        {
                                            type: sequelize.QueryTypes.SELECT
                                        })
                                        if(producto.pcdc_cupon_aplicado == false){
                                            if(producto_con_promocion.length > 0){
                                                let regalados = await cantidadAgregar(producto.pcdc_producto_cantidad, producto_con_promocion[0].promdes_tipo_descuento_id);
                                                let total = await producto.pcdc_producto_cantidad - regalados;
                                                producto_carrito.update({
                                                        pcdc_producto_cantidad: total,
                                                        pcdc_prod_producto_id_promocion: producto.pcdc_prod_producto_id,
                                                        pcdc_cantidad_producto_promocion: regalados,
                                                        pcdc_precio: mejor_precio[0].min,
                                                        pcdc_prod_producto_id_regalo: (producto_regalo.length > 0) ? producto_regalo[0].promdes_sku_gift : null,
                                                        pcdc_cantidad_producto_regalo: (producto_regalo.length > 0) ? producto.pcdc_producto_cantidad : null,
                                                        pcdc_mejor_descuento: (mejor_descuento.length > 0) ?  mejor_descuento[0].mejor_descuento : 0,
                                                        pcdc_tipo_prmocion_individual: (descuento_porcentaje_or_monto_fijo.length > 0) ? descuento_porcentaje_or_monto_fijo[0].promdes_tipo_descuento_id : null,
                                                        pcdc_descuento_promocion: (descuento_porcentaje_or_monto_fijo.length > 0) ? descuento_porcentaje_or_monto_fijo[0].promdes_descuento_exacto : null

                                                });
                                            }else{
                                                producto_carrito.update({
                                                    pcdc_precio: mejor_precio[0].min,
                                                    pcdc_prod_producto_id_regalo: (producto_regalo.length > 0) ? producto_regalo[0].promdes_sku_gift : null,
                                                    pcdc_cantidad_producto_regalo: (producto_regalo.length > 0) ? producto.pcdc_producto_cantidad : null,
                                                    pcdc_mejor_descuento: (mejor_descuento.length > 0) ?  mejor_descuento[0].mejor_descuento : 0,
                                                    pcdc_tipo_prmocion_individual: (descuento_porcentaje_or_monto_fijo.length > 0) ? descuento_porcentaje_or_monto_fijo[0].promdes_tipo_descuento_id : null,
                                                    pcdc_descuento_promocion: (descuento_porcentaje_or_monto_fijo.length > 0) ? descuento_porcentaje_or_monto_fijo[0].promdes_descuento_exacto : null
                                                });
                                            }
                                        }    
                                        if((carrito_de_compra.dataValues.productos_carrito_de_compras.length -1) == indexProducto){
                                            //REGRESAMO CARRITO DETALLE
                                            const carrito_de_compra =  await models.CarritoDeCompra.findOne({
                                                where: {
                                                    cdc_carrito_de_compra_id: carrito_id
                                                }
                                            });
        
                                            const productos_carrito_de_compras = await models.ProductoCarritoDeCompra.findAll({
                                                where: {
                                                    pcdc_carrito_de_compra_id: carrito_de_compra.dataValues.cdc_carrito_de_compra_id
                                                },
                                                order: [
                                                    ['pcdc_prod_producto_id', 'ASC']
                                                ]
                                            });

                                            productos_carrito_de_compras.forEach(async function(producto, indexProducto){
                                                const almacenes_fisicos = await models.Almacenes.findAll({
                                                    where: {
                                                        alm_cmm_estatus_id: statusControllers.ESTATUS_ALMACENES.ACTIVA,
                                                        alm_tipo_almacen: statusControllers.TIPO_ALMACEN.FISICO
                                                    }
                                                });
                                                const producto_carrito = await models.ProductoCarritoDeCompra.findOne({
                                                    where:{
                                                        pcdc_carrito_de_compra_id: producto.dataValues.pcdc_carrito_de_compra_id,
                                                        pcdc_prod_producto_id: producto.dataValues.pcdc_prod_producto_id
                                                    }
                                                });
                                                almacenes_fisicos.forEach(async function(almacenFisico, indexAlmacenFisico){
                                                    const almacen_origen = await sequelize.query(`
                                                    select 
                                                        distinct(total_stock.alm_almacen_id) as almacen,
                                                        total_stock.fisico as fisico,
                                                        case 
                                                            when count(distinct(total_stock.fisico)) = 1  then
                                                                sum(total_stock.sp_cantidad)
                                                            when count(distinct(total_stock.fisico))  > 1 then
                                                                total_stock.sp_cantidad
                                                        end as cantidad,
                                                        total_stock.prod_disponible_backorder
                                                    from( 
                                                        ---Almacen Fisico general tercer
                                                        select
                                                            distinct (a.alm_almacen_id),
                                                            a.alm_almacen_id as fisico,
                                                            sp.sp_cantidad,
                                                            p.prod_disponible_backorder
                                                        from almacenes a 
                                                        left join almacenes_logistica al  on al.almlog_almacen_codigo = a."alm_codigoAlmacen" 
                                                        left join stocks_productos sp ON sp.sp_almacen_id = a.alm_almacen_id 
                                                        left join productos p  on p.prod_producto_id  = sp.sp_prod_producto_id 
                                                        where sp.sp_almacen_id = ` + almacenFisico.dataValues.alm_almacen_id + ` and  a.alm_cmm_estatus_id = ` + statusControllers.ESTATUS_ALMACENES.ACTIVA + ` and sp.sp_prod_producto_id  = ` + producto.dataValues.pcdc_prod_producto_id + `
                                                        union 
                                                        ---Almacen virtual asignado a socio
                                                        select
                                                            distinct(a.alm_almacen_id),
                                                            a2.alm_almacen_id as fisico,
                                                            sp.sp_cantidad,
                                                            p2.prod_disponible_backorder
                                                        from almacenes a 
                                                        left join almacenes a2 on a2.alm_almacen_id = a.alm_fisico
                                                        left join stocks_productos sp on sp.sp_almacen_id  = a.alm_almacen_id 
                                                        left join productos p2 on p2.prod_producto_id  = sp.sp_prod_producto_id 
                                                        left join almacenes_logistica al on al.almlog_almacen_codigo = a2."alm_codigoAlmacen" 
                                                        where a.alm_almacen_id  = ` + almacen_virtual + ` and a.alm_cmm_estatus_id = ` + statusControllers.ESTATUS_ALMACENES.ACTIVA + ` and sp.sp_prod_producto_id  = ` + producto.dataValues.pcdc_prod_producto_id + `
                                                    )total_stock
                                                    group by total_stock.fisico, total_stock.sp_cantidad, total_stock.alm_almacen_id, total_stock.prod_disponible_backorder;
                                                    `, 
                                                    {
                                                        type: sequelize.QueryTypes.SELECT
                                                    });
                                                    console.log('RESULTADO CONSULTA ', almacen_origen, almacen_origen[0].cantidad, producto_carrito.dataValues.pcdc_producto_cantidad)
                                                    if(Number(almacen_origen[0].cantidad) > producto_carrito.dataValues.pcdc_producto_cantidad && (producto.dataValues.pcdc_validado == false)){
                                                        await producto_carrito.update({
                                                            pcdc_almacen_surtido: almacen_origen[0].fisico,
                                                            pcdc_validado: true
                                                        });
                                                    }if((Number(almacen_origen[0].cantidad) < producto_carrito.dataValues.pcdc_producto_cantidad) && (producto.dataValues.pcdc_validado == false)){
                                                        if((almacen_origen[0].prod_disponible_backorder) && (producto.dataValues.pcdc_validado == false)){
                                                            await producto_carrito.update({
                                                                pcdc_back_order: true,
                                                                pcdc_validado: true
                                                            });
                                                        }else if(producto.dataValues.pcdc_validado == false){
                                                            await producto_carrito.update({
                                                                pcdc_no_disponible_para_compra: true,
                                                                pcdc_producto_cantidad: 0,
                                                                pcdc_validado: true
                                                            });
                                                        }
                                                    }
                                                    if((almacenes_fisicos.length -1) == indexAlmacenFisico){
                                                        if((productos_carrito_de_compras.length -1) == indexProducto){
                                                            
                                                            const productos_carrito_de_compras = await models.ProductoCarritoDeCompra.findAll({
                                                                where: {
                                                                    pcdc_carrito_de_compra_id: carrito_de_compra.dataValues.cdc_carrito_de_compra_id
                                                                },
                                                                order: [
                                                                    ['pcdc_prod_producto_id', 'ASC']
                                                                ],
                                                                attributes: {
                                                                    exclude: ['pcdc_validado']
                                                                },
                                                                include: [
                                                                    {
                                                                        model: models.Producto,
                                                                        attributes: {
                                                                            exclude: [
                                                                                'prod_usu_usuario_creado_id',
                                                                                'createdAt',
                                                                                'prod_usu_usuario_modificado_id',
                                                                                'updatedAt',
                                                                                'prod_descripcion_corta',
                                                                                'prod_unidad_medida_venta',
                                                                                'prod_altura',
                                                                                'prod_ancho',
                                                                                'prod_longitud',
                                                                                'prod_peso',
                                                                                'prod_volumen',
                                                                                'prod_total_stock',
                                                                                'prod_proveedor_id',
                                                                                'prod_meta_titulo',
                                                                                'prod_meta_descripcion',
                                                                                'prod_is_kit',
                                                                                'prod_viñetas',
                                                                                'prod_calificacion_promedio',
                                                                                'prod_productos_coleccion_relacionados_id',
                                                                                'prod_productos_coleccion_accesorios_id',
                                                                                'prod_video_url'
                                                                            ]
                                                                        },
                                                                        include: [
                                                                            {
                                                                                model: models.ImagenProducto,
                                                                                attributes: {
                                                                                    exclude: [
                                                                                        'imgprod_imagen_producto_id',
                                                                                        'imgprod_usu_usuario_creador_id',
                                                                                        'createdAt',
                                                                                        'updatedAt'
                                                                                    ]
                                                                                }
                                                                            }
                                                                        ]
                                                                    }
                                                                ]
                                                            });
                                                            res.status(200).send({
                                                                message: 'Producto agregado correctamente.',
                                                                carrito_de_compra,
                                                                productos_carrito_de_compras,
                                                                jsonToProject,
                                                                porcentajeDeAprobacion
                                                            });  
                                                        }
                                                    }
                                                });                                                        
                                            });
                                        }
                                    });
                                }
                            }
                        }else{
                            res.status(300).send({
                                message: 'Carrito de compras no existe o no disponible'
                            });
                        }
                    }
                }else{
                    res.status(500).send({
                        message: 'Error al agregar el producto, el carrito no existe'
                    })
                }
            }else if(carrito_de_compra.dataValues.productos_carrito_de_compras.length == 1){
                await models.ProductoCarritoDeCompra.destroy({
                    where:{
                        pcdc_carrito_de_compra_id: req.body.pcdc_carrito_de_compra_id
                    }
                });
                await models.CarritoDeCompra.destroy({
                    where:{
                        cdc_carrito_de_compra_id: req.body.pcdc_carrito_de_compra_id
                    }
                });
                res.status(200).send({
                    message: 'Carrito eliminado exitosamente.'
                });
            }
        }catch(e){
            res.status(500).send({
                message: 'Error al eliminar el producto',
                e
            });
            next(e);
        }
    },
    //Eliminamos el carrito completo
    deleteCarShop: async(req, res, next) => {
        try{
            await models.ProductoCarritoDeCompra.destroy({
                where:{
                    pcdc_carrito_de_compra_id: req.body.cdc_carrito_de_compra_id
                }
            });
            await models.CarritoDeCompra.destroy({
                where:{
                    cdc_carrito_de_compra_id: req.body.cdc_carrito_de_compra_id
                }
            });
            res.status(200).send({
                message: 'Carrito eliminado exitosamente.'
            });
        }catch(e){
            res.status(500).send({
                message: 'Error al elimnar el carrito de compra',
                e
            });
            next(e);
        }
    },
    //Obtenemos el carrito de copra actualizado
    getCarShopById: async(req, res, next) =>{
        try{
            const carrito_de_compra = await models.CarritoDeCompra.findOne({
                where: {
                    cdc_carrito_de_compra_id: req.params.id
                },
                include: [
                    {
                        model: models.ProductoCarritoDeCompra,
                        include: [
                            {
                                model: models.Producto,
                                attributes: {
                                    exclude: ['prod_cat_categoria_id','prod_usu_usuario_creado_i','createdAt','prod_usu_usuario_modifica','updatedAt','prod_descuento']
                                }
                            }
                        ],
                        attributes:{
                            exclude: ['pcdc_producto_carrito_id','createdAt','updatedAt']
                        }
                    },
                    {
                        model: models.ListaPrecio
                    }
                ]
            });
            const listaPrecio = !!carrito_de_compra.cdc_lista_precio ? carrito_de_compra.cdc_lista_precio : 0;
            const socio = !!carrito_de_compra.cdc_sn_socio_de_negocio_id ? carrito_de_compra.cdc_sn_socio_de_negocio_id : 0;
            const carrito_id = !!carrito_de_compra.cdc_carrito_de_compra_id ? carrito_de_compra.cdc_carrito_de_compra_id : 0;
            let socio_negocio = await models.SociosNegocio.findOne({
                where: {
                    sn_socios_negocio_id: socio
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
            let almacen_virtual  = !!socio_negocio ? socio_negocio.dataValues.sn_almacen_asignado : 0;
            if(!!carrito_de_compra){
                const marcas_con_limitantes = await sequelize.query(`
                select
                    distinct(m.mar_marca_id)
                from productos_carrito_de_compra pcdc 
                left join productos p ON p.prod_producto_id  = pcdc.pcdc_prod_producto_id
                left join marcas m on m.mar_marca_id  = p.prod_mar_marca_id 
                where 
                    pcdc.pcdc_carrito_de_compra_id  = ` + carrito_id + `
                    and
                    m.mar_propiedades_extras is true
                `,
                {
                    type: sequelize.QueryTypes.SELECT    
                });


                const productos_de_proyecto = await sequelize.query(`
                select
                    distinct(pc.pc_prod_producto_id) as producto 
                from cotizaciones_proyectos cp 
                inner join productos_cotizaciones pc on pc.pc_cot_cotizacion_id = cp.cot_cotizacion_id
                where 
                    cp.cot_cmm_estatus_id  = ` + statusControllers.ESTATUS_COTIZACION_PROYECTO.ACTIVO + `
                    and
                    current_date between  current_date and cp.cot_fecha_vencimiento 
                    and 
                    cp.cot_sn_socios_negocio_id  = ` + socio + `;
                `, {
                    type: sequelize.QueryTypes.SELECT
                });
                let idsProyectos = [];

                if(productos_de_proyecto.length > 0){
                    productos_de_proyecto.forEach(async function(proyecto, indexProyecto){
                        idsProyectos.push(proyecto.producto);
                        if((productos_de_proyecto.length -1) == indexProyecto){
                            let to_ids = await idsProyectos.length > 0 ? idsProyectos : 0 ;
                            const productos_de_carrito_total = await sequelize.query(`
                            select
                                count(distinct(pcdc.pcdc_prod_producto_id)) as incluidos
                            from carrito_de_compras cdc 
                            inner join productos_carrito_de_compra pcdc on pcdc.pcdc_carrito_de_compra_id  = cdc.cdc_carrito_de_compra_id 
                            where 
                                cdc.cdc_carrito_de_compra_id  = ` + carrito_id + `
                                and
                                pcdc.pcdc_prod_producto_id  in (` + to_ids + `);            
                            `, {
                                type: sequelize.QueryTypes.SELECT
                            });
    
                            const productos_de_carrito = await sequelize.query(`
                            select
                                count(distinct(pcdc.pcdc_prod_producto_id)) as total
                            from carrito_de_compras cdc 
                            inner join productos_carrito_de_compra pcdc on pcdc.pcdc_carrito_de_compra_id  = cdc.cdc_carrito_de_compra_id 
                            where 
                                cdc.cdc_carrito_de_compra_id  = ` + carrito_id + `;            
                            `, {
                                type: sequelize.QueryTypes.SELECT
                            });
    
                            let porcentajeDeAprobacion = await Number(((Number(productos_de_carrito_total[0].incluidos) / Number(productos_de_carrito[0].total)) * 100).toFixed(2));
                            let jsonToProject = [];
                            if(marcas_con_limitantes.length > 0){
                                marcas_con_limitantes.forEach(async function(marca, indexMarca){
                                    const validacionMarca = await sequelize.query(`
                                    select
                                        sum(sumatotal.precio_con_descuento) as total,
                                        sumatotal.marca,
                                        m.mar_importe,
                                        case 
                                            when m.mar_importe  < sum(sumatotal.precio_con_descuento) then true
                                            when m.mar_importe  > sum(sumatotal.precio_con_descuento) then false
                                        end as cumple
                                    from(
                                        select
                                            descuento.pcdc_producto_cantidad,
                                            descuento.prod_mar_marca_id as marca,
                                            case 
                                                when descuento.pcdc_mejor_descuento >= 10 then  descuento.pcdc_producto_cantidad * (descuento.pcdc_precio -  (descuento.pcdc_precio * cast(concat('0.' || descuento.pcdc_mejor_descuento) as float)))
                                                when descuento.pcdc_mejor_descuento <= 9 then   descuento.pcdc_producto_cantidad * (descuento.pcdc_precio -  (descuento.pcdc_precio * cast(concat('0.0' || descuento.pcdc_mejor_descuento) as float)))
                                            end as precio_con_descuento,
                                            *
                                        from (
                                            select 
                                                *
                                            from productos_carrito_de_compra pcdc 
                                            left join productos p  on p.prod_producto_id  = pcdc.pcdc_prod_producto_id
                                            where 
                                                pcdc.pcdc_carrito_de_compra_id  = ` + carrito_id + `
                                                and 
                                                p.prod_mar_marca_id  = ` + marca.mar_marca_id + `
                                        )descuento
                                    )sumatotal
                                    left join marcas m on m.mar_marca_id  = sumatotal.marca
                                    group  by sumatotal.marca, m.mar_importe;
                                    `, {
                                        type: sequelize.QueryTypes.SELECT
                                    });
                                    jsonToProject.push(validacionMarca[0]);
                                    if((marcas_con_limitantes.length -1) == indexMarca){
                                        const carrito_de_compra =  await models.CarritoDeCompra.findOne({
                                            where: {
                                                cdc_carrito_de_compra_id: carrito_id
                                            },
                                            include: [
                                                {
                                                    model: models.ProductoCarritoDeCompra,
                                                    attributes: {
                                                        exclude: [
                                                            'pcdc_producto_carrito_id',
                                                            'createdAt',
                                                            'updatedAt',
                                                        ]
                                                    }
                                                }
                                            ]
                                        });
                                        carrito_de_compra.dataValues.productos_carrito_de_compras.forEach(async function(producto, indexProducto){
                                            const producto_carrito = await models.ProductoCarritoDeCompra.findOne({
                                                where: {
                                                    pcdc_carrito_de_compra_id: producto.pcdc_carrito_de_compra_id,
                                                    pcdc_prod_producto_id: producto.pcdc_prod_producto_id
                                                }
                                            });
                                            
                                            //Validamos promociones activas
                                            const producto_con_promocion =  await sequelize.query(`         
                                            select 
                                                *
                                            from(
                                                select
                                                    pd.promdes_promocion_descuento_id,
                                                    pd.promdes_fecha_inicio_validez, 
                                                    pd.promdes_fecha_finalizacion_validez,
                                                    pp.prodprom_prod_producto_id,
                                                    pd.promdes_tipo_descuento_id 
                                                from promociones_descuentos pd
                                                left join productos_promociones pp  on pp.prodprom_promdes_promocion_descuento_id  = pd.promdes_promocion_descuento_id 
                                                where 
                                                    (promdes_tipo_descuento_id = ` + statusControllers.TIPO_PROMOCION['2 X 1'] + ` or promdes_tipo_descuento_id  = ` + statusControllers.TIPO_PROMOCION['3 X 2'] + `)
                                                    and
                                                        promdes_estatus_id  = ` + statusControllers.ESTATUS_PROMOCION.ACTIVA + `
                                                    and
                                                    (current_date between  promdes_fecha_inicio_validez and promdes_fecha_finalizacion_validez)
                                                    and 
                                                        promdes_cupon_descuento  is null
                                            )productos
                                            where productos.prodprom_prod_producto_id = ` + producto.pcdc_prod_producto_id + `;`, 
                                            { type: sequelize.QueryTypes.SELECT });
                                            const mejor_precio =  await sequelize.query(`         
                                            select
                                                case 
                                                    when min(mejor_precio.prod_precio) <= 0 then max(mejor_precio.prod_precio) 
                                                    else
                                                        min(mejor_precio.prod_precio) 
                                                end as min
                                            from (
                                                select 
                                                    prod_precio
                                                from productos p 
                                                where prod_producto_id  = ` + producto.pcdc_prod_producto_id + `
                                                union 
                                                select
                                                    pldp.pl_precio_producto 
                                                from productos_lista_de_precio pldp 
                                                where pldp.pl_prod_producto_id = ` + producto.pcdc_prod_producto_id + ` and pldp.pl_listp_lista_de_precio_id  = ` + listaPrecio + `
                                            )mejor_precio;`, 
                                            { type: sequelize.QueryTypes.SELECT });
                                            const producto_regalo = await sequelize.query(`
                                            select 
                                            *
                                            from(
                                                select
                                                    pd.promdes_sku_gift,
                                                    pd.promdes_promocion_descuento_id,
                                                    pd.promdes_fecha_inicio_validez, 
                                                    pd.promdes_fecha_finalizacion_validez,
                                                    pp.prodprom_prod_producto_id,
                                                    pd.promdes_tipo_descuento_id 
                                                from promociones_descuentos pd
                                                left join productos_promociones pp  on pp.prodprom_promdes_promocion_descuento_id  = pd.promdes_promocion_descuento_id 
                                                where 
                                                    (promdes_tipo_descuento_id = ` + statusControllers.TIPO_PROMOCION['Regalo'] + `)
                                                    and
                                                        promdes_estatus_id  = `+ statusControllers.ESTATUS_PROMOCION.ACTIVA +`
                                                    and
                                                    (current_date between  promdes_fecha_inicio_validez and promdes_fecha_finalizacion_validez)
                                                    and 
                                                        promdes_cupon_descuento  is null
                                            )productos
                                            where productos.prodprom_prod_producto_id = ` + producto.pcdc_prod_producto_id + `;
                                            `, { type: sequelize.QueryTypes.SELECT} );
                                            const mejor_descuento = await sequelize.query(`
                                            select
                                                case 
                                                    when max(mejor_descuento.descuento) <= 9 then cast(concat(0, max(mejor_descuento.descuento)) as integer)
                                                    else max(mejor_descuento.descuento) 
                                                end as mejor_descuento
                                            from( 
                                                select 
                                                    prod_descuento as descuento
                                                from productos p 
                                                where prod_producto_id  = ` + producto.pcdc_prod_producto_id + `
                                                union
                                                select 
                                                    m.mar_descuento as descuento
                                                from productos p2 
                                                left join marcas m ON  m.mar_marca_id  = p2.prod_mar_marca_id  
                                                where p2.prod_producto_id  = ` + producto.pcdc_prod_producto_id + `
                                                union 
                                                select 
                                                    case 
                                                        when sn.sn_descuento >= ldp.listp_descuento then sn.sn_descuento
                                                        when ldp.listp_descuento >= sn.sn_descuento then ldp.listp_descuento
                                                    end as descuento
                                                from socios_negocio sn 
                                                left join listas_de_precios ldp on ldp.listp_lista_de_precio_id  = sn.sn_socios_negocio_id 
                                                where sn.sn_socios_negocio_id  = ` + socio + `
                                            )mejor_descuento;`, { type: sequelize.QueryTypes.SELECT });
                                            const descuento_porcentaje_or_monto_fijo = await sequelize.query(`
                                            select 
                                                *
                                            from(
                                                select
                                                    pd.promdes_tipo_descuento_id,
                                                    pd.promdes_promocion_descuento_id,
                                                    pd.promdes_descuento_exacto,
                                                    pd.promdes_fecha_inicio_validez, 
                                                    pd.promdes_fecha_finalizacion_validez,
                                                    pp.prodprom_prod_producto_id,
                                                    pd.promdes_tipo_descuento_id 
                                                from promociones_descuentos pd
                                                left join productos_promociones pp  on pp.prodprom_promdes_promocion_descuento_id  = pd.promdes_promocion_descuento_id 
                                                where 
                                                    (promdes_tipo_descuento_id = ` + statusControllers.TIPO_PROMOCION.Porcentaje + ` or promdes_tipo_descuento_id  = ` + statusControllers.TIPO_PROMOCION['Monto fijo'] + `)
                                                    and
                                                        promdes_estatus_id  = ` + statusControllers.ESTATUS_PROMOCION.ACTIVA + `
                                                    and
                                                    (current_date between  promdes_fecha_inicio_validez and promdes_fecha_finalizacion_validez)
                                                    and 
                                                    promdes_carrito_articulo is true
                                                    and 
                                                        promdes_cupon_descuento  is null
                                            )productos
                                            where productos.prodprom_prod_producto_id = ` +  producto.pcdc_prod_producto_id + `
                                            `, 
                                            {
                                                type: sequelize.QueryTypes.SELECT
                                            });
                                            if(producto.pcdc_cupon_aplicado == false){
                                                if(producto_con_promocion.length > 0){
                                                    let regalados = await cantidadAgregar(producto.pcdc_producto_cantidad, producto_con_promocion[0].promdes_tipo_descuento_id);
                                                    let total = await producto.pcdc_producto_cantidad - regalados;
                                                    producto_carrito.update({
                                                            pcdc_producto_cantidad: total,
                                                            pcdc_cantidad_producto_promocion: regalados,
                                                            pcdc_prod_producto_id_promocion: producto.pcdc_prod_producto_id,
                                                            pcdc_precio: mejor_precio[0].min,
                                                            pcdc_prod_producto_id_regalo: (producto_regalo.length > 0) ? producto_regalo[0].promdes_sku_gift : null,
                                                            pcdc_cantidad_producto_regalo: (producto_regalo.length > 0) ? producto.pcdc_producto_cantidad : null,
                                                            pcdc_mejor_descuento: (mejor_descuento.length > 0) ?  mejor_descuento[0].mejor_descuento : 0,
                                                            pcdc_tipo_prmocion_individual: (descuento_porcentaje_or_monto_fijo.length > 0) ? descuento_porcentaje_or_monto_fijo[0].promdes_tipo_descuento_id : null,
                                                            pcdc_descuento_promocion: (descuento_porcentaje_or_monto_fijo.length > 0) ? descuento_porcentaje_or_monto_fijo[0].promdes_descuento_exacto : null
    
                                                    });
                                                }else{
                                                    producto_carrito.update({
                                                        pcdc_precio: mejor_precio[0].min,
                                                        pcdc_prod_producto_id_regalo: (producto_regalo.length > 0) ? producto_regalo[0].promdes_sku_gift : null,
                                                        pcdc_cantidad_producto_regalo: (producto_regalo.length > 0) ? producto.pcdc_producto_cantidad : null,
                                                        pcdc_mejor_descuento: (mejor_descuento.length > 0) ?  mejor_descuento[0].mejor_descuento : 0,
                                                        pcdc_tipo_prmocion_individual: (descuento_porcentaje_or_monto_fijo.length > 0) ? descuento_porcentaje_or_monto_fijo[0].promdes_tipo_descuento_id : null,
                                                        pcdc_descuento_promocion: (descuento_porcentaje_or_monto_fijo.length > 0) ? descuento_porcentaje_or_monto_fijo[0].promdes_descuento_exacto : null
                                                    });
                                                }
                                            }
                                            if((carrito_de_compra.dataValues.productos_carrito_de_compras.length -1) == indexProducto){
                                                //REGRESAMO CARRITO DETALLE
                                                const carrito_de_compra =  await models.CarritoDeCompra.findOne({
                                                    where: {
                                                        cdc_carrito_de_compra_id: carrito_id
                                                    }
                                                });
            
                                                const productos_carrito_de_compras = await models.ProductoCarritoDeCompra.findAll({
                                                    where: {
                                                        pcdc_carrito_de_compra_id: carrito_de_compra.dataValues.cdc_carrito_de_compra_id
                                                    },
                                                    order: [
                                                        ['pcdc_prod_producto_id', 'ASC']
                                                    ]
                                                });

                                                productos_carrito_de_compras.forEach(async function(producto, indexProducto){
                                                    const almacenes_fisicos = await models.Almacenes.findAll({
                                                        where: {
                                                            alm_cmm_estatus_id: statusControllers.ESTATUS_ALMACENES.ACTIVA,
                                                            alm_tipo_almacen: statusControllers.TIPO_ALMACEN.FISICO
                                                        }
                                                    });
                                                    const producto_carrito = await models.ProductoCarritoDeCompra.findOne({
                                                        where:{
                                                            pcdc_carrito_de_compra_id: producto.dataValues.pcdc_carrito_de_compra_id,
                                                            pcdc_prod_producto_id: producto.dataValues.pcdc_prod_producto_id
                                                        }
                                                    });
                                                    almacenes_fisicos.forEach(async function(almacenFisico, indexAlmacenFisico){
                                                        const almacen_origen = await sequelize.query(`
                                                        select 
                                                            distinct(total_stock.alm_almacen_id) as almacen,
                                                            total_stock.fisico as fisico,
                                                            case 
                                                                when count(distinct(total_stock.fisico)) = 1  then
                                                                    sum(total_stock.sp_cantidad)
                                                                when count(distinct(total_stock.fisico))  > 1 then
                                                                    total_stock.sp_cantidad
                                                            end as cantidad,
                                                            total_stock.prod_disponible_backorder
                                                        from( 
                                                            ---Almacen Fisico general tercer
                                                            select
                                                                distinct (a.alm_almacen_id),
                                                                a.alm_almacen_id as fisico,
                                                                sp.sp_cantidad,
                                                                p.prod_disponible_backorder
                                                            from almacenes a 
                                                            left join almacenes_logistica al  on al.almlog_almacen_codigo = a."alm_codigoAlmacen" 
                                                            left join stocks_productos sp ON sp.sp_almacen_id = a.alm_almacen_id 
                                                            left join productos p  on p.prod_producto_id  = sp.sp_prod_producto_id 
                                                            where sp.sp_almacen_id = ` + almacenFisico.dataValues.alm_almacen_id + ` and  a.alm_cmm_estatus_id = ` + statusControllers.ESTATUS_ALMACENES.ACTIVA + ` and sp.sp_prod_producto_id  = ` + producto.dataValues.pcdc_prod_producto_id + `
                                                            union 
                                                            ---Almacen virtual asignado a socio
                                                            select
                                                                distinct(a.alm_almacen_id),
                                                                a2.alm_almacen_id as fisico,
                                                                sp.sp_cantidad,
                                                                p2.prod_disponible_backorder
                                                            from almacenes a 
                                                            left join almacenes a2 on a2.alm_almacen_id = a.alm_fisico
                                                            left join stocks_productos sp on sp.sp_almacen_id  = a.alm_almacen_id 
                                                            left join productos p2 on p2.prod_producto_id  = sp.sp_prod_producto_id 
                                                            left join almacenes_logistica al on al.almlog_almacen_codigo = a2."alm_codigoAlmacen" 
                                                            where a.alm_almacen_id  = ` + almacen_virtual + ` and a.alm_cmm_estatus_id = ` + statusControllers.ESTATUS_ALMACENES.ACTIVA + ` and sp.sp_prod_producto_id  = ` + producto.dataValues.pcdc_prod_producto_id + `
                                                        )total_stock
                                                        group by total_stock.fisico, total_stock.sp_cantidad, total_stock.alm_almacen_id, total_stock.prod_disponible_backorder;
                                                        `, 
                                                        {
                                                            type: sequelize.QueryTypes.SELECT
                                                        });
                                                        console.log('RESULTADO CONSULTA ', almacen_origen, almacen_origen[0].cantidad, producto_carrito.dataValues.pcdc_producto_cantidad)
                                                        if(Number(almacen_origen[0].cantidad) > producto_carrito.dataValues.pcdc_producto_cantidad && (producto.dataValues.pcdc_validado == false)){
                                                            await producto_carrito.update({
                                                                pcdc_almacen_surtido: almacen_origen[0].fisico,
                                                                pcdc_validado: true
                                                            });
                                                        }if((Number(almacen_origen[0].cantidad) < producto_carrito.dataValues.pcdc_producto_cantidad) && (producto.dataValues.pcdc_validado == false)){
                                                            if((almacen_origen[0].prod_disponible_backorder) && (producto.dataValues.pcdc_validado == false)){
                                                                await producto_carrito.update({
                                                                    pcdc_back_order: true,
                                                                    pcdc_validado: true
                                                                });
                                                            }else if(producto.dataValues.pcdc_validado == false){
                                                                await producto_carrito.update({
                                                                    pcdc_no_disponible_para_compra: true,
                                                                    pcdc_producto_cantidad: 0,
                                                                    pcdc_validado: true
                                                                });
                                                            }
                                                        }
                                                        if((almacenes_fisicos.length -1) == indexAlmacenFisico){
                                                            if((productos_carrito_de_compras.length -1) == indexProducto){
                                                                
                                                                const productos_carrito_de_compras = await models.ProductoCarritoDeCompra.findAll({
                                                                    where: {
                                                                        pcdc_carrito_de_compra_id: carrito_de_compra.dataValues.cdc_carrito_de_compra_id
                                                                    },
                                                                    order: [
                                                                        ['pcdc_prod_producto_id', 'ASC']
                                                                    ],
                                                                    attributes: {
                                                                        exclude: ['pcdc_validado']
                                                                    },
                                                                    include: [
                                                                        {
                                                                            model: models.Producto,
                                                                            attributes: {
                                                                                exclude: [
                                                                                    'prod_usu_usuario_creado_id',
                                                                                    'createdAt',
                                                                                    'prod_usu_usuario_modificado_id',
                                                                                    'updatedAt',
                                                                                    'prod_descripcion_corta',
                                                                                    'prod_unidad_medida_venta',
                                                                                    'prod_altura',
                                                                                    'prod_ancho',
                                                                                    'prod_longitud',
                                                                                    'prod_peso',
                                                                                    'prod_volumen',
                                                                                    'prod_total_stock',
                                                                                    'prod_proveedor_id',
                                                                                    'prod_meta_titulo',
                                                                                    'prod_meta_descripcion',
                                                                                    'prod_is_kit',
                                                                                    'prod_viñetas',
                                                                                    'prod_calificacion_promedio',
                                                                                    'prod_productos_coleccion_relacionados_id',
                                                                                    'prod_productos_coleccion_accesorios_id',
                                                                                    'prod_video_url'
                                                                                ]
                                                                            },
                                                                            include: [
                                                                                {
                                                                                    model: models.ImagenProducto,
                                                                                    attributes: {
                                                                                        exclude: [
                                                                                            'imgprod_imagen_producto_id',
                                                                                            'imgprod_usu_usuario_creador_id',
                                                                                            'createdAt',
                                                                                            'updatedAt'
                                                                                        ]
                                                                                    }
                                                                                }
                                                                            ]
                                                                        }
                                                                    ]
                                                                });
                                                                res.status(200).send({
                                                                    message: 'Producto agregado correctamente.',
                                                                    carrito_de_compra,
                                                                    productos_carrito_de_compras,
                                                                    jsonToProject,
                                                                    porcentajeDeAprobacion
                                                                });  
                                                            }
                                                        }
                                                    });                                                        
                                                });
                                            }
                                        });
                                    }
                                });
                            }else{
                                const carrito_de_compra =  await models.CarritoDeCompra.findOne({
                                    where: {
                                        cdc_carrito_de_compra_id: carrito_id
                                    },
                                    include: [
                                        {
                                            model: models.ProductoCarritoDeCompra,
                                            attributes: {
                                                exclude: [
                                                    'pcdc_producto_carrito_id',
                                                    'createdAt',
                                                    'updatedAt',
                                                ]
                                            },
                                            include: [
                                                {
                                                    model: models.Producto,
                                                    include: [
                                                        {
                                                            model: models.ImagenProducto
                                                        }
                                                    ]
                                                }
                                            ]
                                        }
                                    ]
                                });
                                carrito_de_compra.dataValues.productos_carrito_de_compras.forEach(async function(producto, indexProducto){
                                    const producto_carrito = await models.ProductoCarritoDeCompra.findOne({
                                        where: {
                                            pcdc_carrito_de_compra_id: producto.pcdc_carrito_de_compra_id,
                                            pcdc_prod_producto_id: producto.pcdc_prod_producto_id
                                        }
                                    });
                                    
                                    //Validamos promociones activas
                                    const producto_con_promocion =  await sequelize.query(`         
                                    select 
                                        *
                                    from(
                                        select
                                            pd.promdes_promocion_descuento_id,
                                            pd.promdes_fecha_inicio_validez, 
                                            pd.promdes_fecha_finalizacion_validez,
                                            pp.prodprom_prod_producto_id,
                                            pd.promdes_tipo_descuento_id 
                                        from promociones_descuentos pd
                                        left join productos_promociones pp  on pp.prodprom_promdes_promocion_descuento_id  = pd.promdes_promocion_descuento_id 
                                        where 
                                            (promdes_tipo_descuento_id = ` + statusControllers.TIPO_PROMOCION['2 X 1'] + ` or promdes_tipo_descuento_id  = ` + statusControllers.TIPO_PROMOCION['3 X 2'] + `)
                                            and
                                                promdes_estatus_id  = ` + statusControllers.ESTATUS_PROMOCION.ACTIVA + `
                                            and
                                            (current_date between  promdes_fecha_inicio_validez and promdes_fecha_finalizacion_validez)
                                            and 
                                                promdes_cupon_descuento  is null
                                    )productos
                                    where productos.prodprom_prod_producto_id = ` + producto.pcdc_prod_producto_id + `;`, 
                                    { type: sequelize.QueryTypes.SELECT });
                                    const mejor_precio =  await sequelize.query(`         
                                    select
                                        case 
                                            when min(mejor_precio.prod_precio) <= 0 then max(mejor_precio.prod_precio) 
                                            else
                                                min(mejor_precio.prod_precio) 
                                        end as min
                                    from (
                                        select 
                                            prod_precio
                                        from productos p 
                                        where prod_producto_id  = ` + producto.pcdc_prod_producto_id + `
                                        union 
                                        select
                                            pldp.pl_precio_producto 
                                        from productos_lista_de_precio pldp 
                                        where pldp.pl_prod_producto_id = ` + producto.pcdc_prod_producto_id + ` and pldp.pl_listp_lista_de_precio_id  = ` + listaPrecio + `
                                    )mejor_precio;`, 
                                    { type: sequelize.QueryTypes.SELECT });
                                    const producto_regalo = await sequelize.query(`
                                    select 
                                    *
                                    from(
                                        select
                                            pd.promdes_sku_gift,
                                            pd.promdes_promocion_descuento_id,
                                            pd.promdes_fecha_inicio_validez, 
                                            pd.promdes_fecha_finalizacion_validez,
                                            pp.prodprom_prod_producto_id,
                                            pd.promdes_tipo_descuento_id 
                                        from promociones_descuentos pd
                                        left join productos_promociones pp  on pp.prodprom_promdes_promocion_descuento_id  = pd.promdes_promocion_descuento_id 
                                        where 
                                            (promdes_tipo_descuento_id = ` + statusControllers.TIPO_PROMOCION['Regalo'] + `)
                                            and
                                                promdes_estatus_id  = `+ statusControllers.ESTATUS_PROMOCION.ACTIVA +`
                                            and
                                            (current_date between  promdes_fecha_inicio_validez and promdes_fecha_finalizacion_validez)
                                            and 
                                                promdes_cupon_descuento  is null
                                    )productos
                                    where productos.prodprom_prod_producto_id = ` + producto.pcdc_prod_producto_id + `;
                                    `, { type: sequelize.QueryTypes.SELECT} );
                                    const mejor_descuento = await sequelize.query(`
                                    select
                                        case 
                                            when max(mejor_descuento.descuento) <= 9 then cast(concat(0, max(mejor_descuento.descuento)) as integer)
                                            else max(mejor_descuento.descuento) 
                                        end as mejor_descuento
                                    from( 
                                        select 
                                            prod_descuento as descuento
                                        from productos p 
                                        where prod_producto_id  = ` + producto.pcdc_prod_producto_id + `
                                        union
                                        select 
                                            m.mar_descuento as descuento
                                        from productos p2 
                                        left join marcas m ON  m.mar_marca_id  = p2.prod_mar_marca_id  
                                        where p2.prod_producto_id  = ` + producto.pcdc_prod_producto_id + `
                                        union 
                                        select 
                                            case 
                                                when sn.sn_descuento >= ldp.listp_descuento then sn.sn_descuento
                                                when ldp.listp_descuento >= sn.sn_descuento then ldp.listp_descuento
                                            end as descuento
                                        from socios_negocio sn 
                                        left join listas_de_precios ldp on ldp.listp_lista_de_precio_id  = sn.sn_socios_negocio_id 
                                        where sn.sn_socios_negocio_id  = ` + socio + `
                                    )mejor_descuento;`, { type: sequelize.QueryTypes.SELECT });
                                    const descuento_porcentaje_or_monto_fijo = await sequelize.query(`
                                    select 
                                        *
                                    from(
                                        select
                                            pd.promdes_tipo_descuento_id,
                                            pd.promdes_promocion_descuento_id,
                                            pd.promdes_descuento_exacto,
                                            pd.promdes_fecha_inicio_validez, 
                                            pd.promdes_fecha_finalizacion_validez,
                                            pp.prodprom_prod_producto_id,
                                            pd.promdes_tipo_descuento_id 
                                        from promociones_descuentos pd
                                        left join productos_promociones pp  on pp.prodprom_promdes_promocion_descuento_id  = pd.promdes_promocion_descuento_id 
                                        where 
                                            (promdes_tipo_descuento_id = ` + statusControllers.TIPO_PROMOCION.Porcentaje + ` or promdes_tipo_descuento_id  = ` + statusControllers.TIPO_PROMOCION['Monto fijo'] + `)
                                            and
                                                promdes_estatus_id  = ` + statusControllers.ESTATUS_PROMOCION.ACTIVA + `
                                            and
                                            (current_date between  promdes_fecha_inicio_validez and promdes_fecha_finalizacion_validez)
                                            and 
                                            promdes_carrito_articulo is true
                                            and 
                                                promdes_cupon_descuento  is null
                                    )productos
                                    where productos.prodprom_prod_producto_id = ` +  producto.pcdc_prod_producto_id + `
                                    `, 
                                    {
                                        type: sequelize.QueryTypes.SELECT
                                    })
                                    if(producto.pcdc_cupon_aplicado == false){
                                        if(producto_con_promocion.length > 0){
                                            let regalados = await cantidadAgregar(producto.pcdc_producto_cantidad, producto_con_promocion[0].promdes_tipo_descuento_id);
                                            let total = await producto.pcdc_producto_cantidad - regalados;
                                            producto_carrito.update({
                                                    pcdc_producto_cantidad: total,
                                                    pcdc_prod_producto_id_promocion: producto.pcdc_prod_producto_id,
                                                    pcdc_cantidad_producto_promocion: regalados,
                                                    pcdc_precio: mejor_precio[0].min,
                                                    pcdc_prod_producto_id_regalo: (producto_regalo.length > 0) ? producto_regalo[0].promdes_sku_gift : null,
                                                    pcdc_cantidad_producto_regalo: (producto_regalo.length > 0) ? producto.pcdc_producto_cantidad : null,
                                                    pcdc_mejor_descuento: (mejor_descuento.length > 0) ?  mejor_descuento[0].mejor_descuento : 0,
                                                    pcdc_tipo_prmocion_individual: (descuento_porcentaje_or_monto_fijo.length > 0) ? descuento_porcentaje_or_monto_fijo[0].promdes_tipo_descuento_id : null,
                                                    pcdc_descuento_promocion: (descuento_porcentaje_or_monto_fijo.length > 0) ? descuento_porcentaje_or_monto_fijo[0].promdes_descuento_exacto : null
    
                                            });
                                        }else{
                                            producto_carrito.update({
                                                pcdc_precio: mejor_precio[0].min,
                                                pcdc_prod_producto_id_regalo: (producto_regalo.length > 0) ? producto_regalo[0].promdes_sku_gift : null,
                                                pcdc_cantidad_producto_regalo: (producto_regalo.length > 0) ? producto.pcdc_producto_cantidad : null,
                                                pcdc_mejor_descuento: (mejor_descuento.length > 0) ?  mejor_descuento[0].mejor_descuento : 0,
                                                pcdc_tipo_prmocion_individual: (descuento_porcentaje_or_monto_fijo.length > 0) ? descuento_porcentaje_or_monto_fijo[0].promdes_tipo_descuento_id : null,
                                                pcdc_descuento_promocion: (descuento_porcentaje_or_monto_fijo.length > 0) ? descuento_porcentaje_or_monto_fijo[0].promdes_descuento_exacto : null
                                            });
                                        }
                                    }    
                                    if((carrito_de_compra.dataValues.productos_carrito_de_compras.length -1) == indexProducto){
                                        //REGRESAMO CARRITO DETALLE
                                        const carrito_de_compra =  await models.CarritoDeCompra.findOne({
                                            where: {
                                                cdc_carrito_de_compra_id: carrito_id
                                            }
                                        });
    
                                        const productos_carrito_de_compras = await models.ProductoCarritoDeCompra.findAll({
                                            where: {
                                                pcdc_carrito_de_compra_id: carrito_de_compra.dataValues.cdc_carrito_de_compra_id
                                            },
                                            order: [
                                                ['pcdc_prod_producto_id', 'ASC']
                                            ]
                                        });

                                        productos_carrito_de_compras.forEach(async function(producto, indexProducto){
                                            const almacenes_fisicos = await models.Almacenes.findAll({
                                                where: {
                                                    alm_cmm_estatus_id: statusControllers.ESTATUS_ALMACENES.ACTIVA,
                                                    alm_tipo_almacen: statusControllers.TIPO_ALMACEN.FISICO
                                                }
                                            });
                                            const producto_carrito = await models.ProductoCarritoDeCompra.findOne({
                                                where:{
                                                    pcdc_carrito_de_compra_id: producto.dataValues.pcdc_carrito_de_compra_id,
                                                    pcdc_prod_producto_id: producto.dataValues.pcdc_prod_producto_id
                                                }
                                            });
                                            almacenes_fisicos.forEach(async function(almacenFisico, indexAlmacenFisico){
                                                const almacen_origen = await sequelize.query(`
                                                select 
                                                    distinct(total_stock.alm_almacen_id) as almacen,
                                                    total_stock.fisico as fisico,
                                                    case 
                                                        when count(distinct(total_stock.fisico)) = 1  then
                                                            sum(total_stock.sp_cantidad)
                                                        when count(distinct(total_stock.fisico))  > 1 then
                                                            total_stock.sp_cantidad
                                                    end as cantidad,
                                                    total_stock.prod_disponible_backorder
                                                from( 
                                                    ---Almacen Fisico general tercer
                                                    select
                                                        distinct (a.alm_almacen_id),
                                                        a.alm_almacen_id as fisico,
                                                        sp.sp_cantidad,
                                                        p.prod_disponible_backorder
                                                    from almacenes a 
                                                    left join almacenes_logistica al  on al.almlog_almacen_codigo = a."alm_codigoAlmacen" 
                                                    left join stocks_productos sp ON sp.sp_almacen_id = a.alm_almacen_id 
                                                    left join productos p  on p.prod_producto_id  = sp.sp_prod_producto_id 
                                                    where sp.sp_almacen_id = ` + almacenFisico.dataValues.alm_almacen_id + ` and  a.alm_cmm_estatus_id = ` + statusControllers.ESTATUS_ALMACENES.ACTIVA + ` and sp.sp_prod_producto_id  = ` + producto.dataValues.pcdc_prod_producto_id + `
                                                    union 
                                                    ---Almacen virtual asignado a socio
                                                    select
                                                        distinct(a.alm_almacen_id),
                                                        a2.alm_almacen_id as fisico,
                                                        sp.sp_cantidad,
                                                        p2.prod_disponible_backorder
                                                    from almacenes a 
                                                    left join almacenes a2 on a2.alm_almacen_id = a.alm_fisico
                                                    left join stocks_productos sp on sp.sp_almacen_id  = a.alm_almacen_id 
                                                    left join productos p2 on p2.prod_producto_id  = sp.sp_prod_producto_id 
                                                    left join almacenes_logistica al on al.almlog_almacen_codigo = a2."alm_codigoAlmacen" 
                                                    where a.alm_almacen_id  = ` + almacen_virtual + ` and a.alm_cmm_estatus_id = ` + statusControllers.ESTATUS_ALMACENES.ACTIVA + ` and sp.sp_prod_producto_id  = ` + producto.dataValues.pcdc_prod_producto_id + `
                                                )total_stock
                                                group by total_stock.fisico, total_stock.sp_cantidad, total_stock.alm_almacen_id, total_stock.prod_disponible_backorder;
                                                `, 
                                                {
                                                    type: sequelize.QueryTypes.SELECT
                                                });
                                                console.log('RESULTADO CONSULTA ', almacen_origen, almacen_origen[0].cantidad, producto_carrito.dataValues.pcdc_producto_cantidad)
                                                if(Number(almacen_origen[0].cantidad) > producto_carrito.dataValues.pcdc_producto_cantidad && (producto.dataValues.pcdc_validado == false)){
                                                    await producto_carrito.update({
                                                        pcdc_almacen_surtido: almacen_origen[0].fisico,
                                                        pcdc_validado: true
                                                    });
                                                }if((Number(almacen_origen[0].cantidad) < producto_carrito.dataValues.pcdc_producto_cantidad) && (producto.dataValues.pcdc_validado == false)){
                                                    if((almacen_origen[0].prod_disponible_backorder) && (producto.dataValues.pcdc_validado == false)){
                                                        await producto_carrito.update({
                                                            pcdc_back_order: true,
                                                            pcdc_validado: true
                                                        });
                                                    }else if(producto.dataValues.pcdc_validado == false){
                                                        await producto_carrito.update({
                                                            pcdc_no_disponible_para_compra: true,
                                                            pcdc_producto_cantidad: 0,
                                                            pcdc_validado: true
                                                        });
                                                    }
                                                }
                                                if((almacenes_fisicos.length -1) == indexAlmacenFisico){
                                                    if((productos_carrito_de_compras.length -1) == indexProducto){
                                                        
                                                        const productos_carrito_de_compras = await models.ProductoCarritoDeCompra.findAll({
                                                            where: {
                                                                pcdc_carrito_de_compra_id: carrito_de_compra.dataValues.cdc_carrito_de_compra_id
                                                            },
                                                            order: [
                                                                ['pcdc_prod_producto_id', 'ASC']
                                                            ],
                                                            attributes: {
                                                                exclude: ['pcdc_validado']
                                                            },
                                                            include: [
                                                                {
                                                                    model: models.Producto,
                                                                    attributes: {
                                                                        exclude: [
                                                                            'prod_usu_usuario_creado_id',
                                                                            'createdAt',
                                                                            'prod_usu_usuario_modificado_id',
                                                                            'updatedAt',
                                                                            'prod_descripcion_corta',
                                                                            'prod_unidad_medida_venta',
                                                                            'prod_altura',
                                                                            'prod_ancho',
                                                                            'prod_longitud',
                                                                            'prod_peso',
                                                                            'prod_volumen',
                                                                            'prod_total_stock',
                                                                            'prod_proveedor_id',
                                                                            'prod_meta_titulo',
                                                                            'prod_meta_descripcion',
                                                                            'prod_is_kit',
                                                                            'prod_viñetas',
                                                                            'prod_calificacion_promedio',
                                                                            'prod_productos_coleccion_relacionados_id',
                                                                            'prod_productos_coleccion_accesorios_id',
                                                                            'prod_video_url'
                                                                        ]
                                                                    },
                                                                    include: [
                                                                        {
                                                                            model: models.ImagenProducto,
                                                                            attributes: {
                                                                                exclude: [
                                                                                    'imgprod_imagen_producto_id',
                                                                                    'imgprod_usu_usuario_creador_id',
                                                                                    'createdAt',
                                                                                    'updatedAt'
                                                                                ]
                                                                            }
                                                                        }
                                                                    ]
                                                                }
                                                            ]
                                                        });
                                                        res.status(200).send({
                                                            message: 'Producto agregado correctamente.',
                                                            carrito_de_compra,
                                                            productos_carrito_de_compras,
                                                            jsonToProject,
                                                            porcentajeDeAprobacion
                                                        });  
                                                    }
                                                }
                                            });                                                        
                                        });  
                                    }
                                });
    
                            }
                        }
                    });
                }else{
                    let to_ids = await idsProyectos.length > 0 ? idsProyectos : 0 ;
                    const productos_de_carrito_total = await sequelize.query(`
                    select
                        count(distinct(pcdc.pcdc_prod_producto_id)) as incluidos
                    from carrito_de_compras cdc 
                    inner join productos_carrito_de_compra pcdc on pcdc.pcdc_carrito_de_compra_id  = cdc.cdc_carrito_de_compra_id 
                    where 
                        cdc.cdc_carrito_de_compra_id  = ` + carrito_id + `
                        and
                        pcdc.pcdc_prod_producto_id  in (` + to_ids + `);            
                    `, {
                        type: sequelize.QueryTypes.SELECT
                    });

                    const productos_de_carrito = await sequelize.query(`
                    select
                        count(distinct(pcdc.pcdc_prod_producto_id)) as total
                    from carrito_de_compras cdc 
                    inner join productos_carrito_de_compra pcdc on pcdc.pcdc_carrito_de_compra_id  = cdc.cdc_carrito_de_compra_id 
                    where 
                        cdc.cdc_carrito_de_compra_id  = ` + carrito_id + `;            
                    `, {
                        type: sequelize.QueryTypes.SELECT
                    });

                    let porcentajeDeAprobacion = await Number(((Number(productos_de_carrito_total[0].incluidos) / Number(productos_de_carrito[0].total)) * 100).toFixed(2));
                    let jsonToProject = [];
                    if(marcas_con_limitantes.length > 0){
                        marcas_con_limitantes.forEach(async function(marca, indexMarca){
                            const validacionMarca = await sequelize.query(`
                            select
                                sum(sumatotal.precio_con_descuento) as total,
                                sumatotal.marca,
                                m.mar_importe,
                                case 
                                    when m.mar_importe  < sum(sumatotal.precio_con_descuento) then true
                                    when m.mar_importe  > sum(sumatotal.precio_con_descuento) then false
                                end as cumple
                            from(
                                select
                                    descuento.pcdc_producto_cantidad,
                                    descuento.prod_mar_marca_id as marca,
                                    case 
                                        when descuento.pcdc_mejor_descuento >= 10 then  descuento.pcdc_producto_cantidad * (descuento.pcdc_precio -  (descuento.pcdc_precio * cast(concat('0.' || descuento.pcdc_mejor_descuento) as float)))
                                        when descuento.pcdc_mejor_descuento <= 9 then   descuento.pcdc_producto_cantidad * (descuento.pcdc_precio -  (descuento.pcdc_precio * cast(concat('0.0' || descuento.pcdc_mejor_descuento) as float)))
                                    end as precio_con_descuento,
                                    *
                                from (
                                    select 
                                        *
                                    from productos_carrito_de_compra pcdc 
                                    left join productos p  on p.prod_producto_id  = pcdc.pcdc_prod_producto_id
                                    where 
                                        pcdc.pcdc_carrito_de_compra_id  = ` + carrito_id + `
                                        and 
                                        p.prod_mar_marca_id  = ` + marca.mar_marca_id + `
                                )descuento
                            )sumatotal
                            left join marcas m on m.mar_marca_id  = sumatotal.marca
                            group  by sumatotal.marca, m.mar_importe;
                            `, {
                                type: sequelize.QueryTypes.SELECT
                            });
                            jsonToProject.push(validacionMarca[0]);
                            if((marcas_con_limitantes.length -1) == indexMarca){
                                const carrito_de_compra =  await models.CarritoDeCompra.findOne({
                                    where: {
                                        cdc_carrito_de_compra_id: carrito_id
                                    },
                                    include: [
                                        {
                                            model: models.ProductoCarritoDeCompra,
                                            attributes: {
                                                exclude: [
                                                    'pcdc_producto_carrito_id',
                                                    'createdAt',
                                                    'updatedAt',
                                                ]
                                            }
                                        }
                                    ]
                                });
                                carrito_de_compra.dataValues.productos_carrito_de_compras.forEach(async function(producto, indexProducto){
                                    const producto_carrito = await models.ProductoCarritoDeCompra.findOne({
                                        where: {
                                            pcdc_carrito_de_compra_id: producto.pcdc_carrito_de_compra_id,
                                            pcdc_prod_producto_id: producto.pcdc_prod_producto_id
                                        }
                                    });
                                    
                                    //Validamos promociones activas
                                    const producto_con_promocion =  await sequelize.query(`         
                                    select 
                                        *
                                    from(
                                        select
                                            pd.promdes_promocion_descuento_id,
                                            pd.promdes_fecha_inicio_validez, 
                                            pd.promdes_fecha_finalizacion_validez,
                                            pp.prodprom_prod_producto_id,
                                            pd.promdes_tipo_descuento_id 
                                        from promociones_descuentos pd
                                        left join productos_promociones pp  on pp.prodprom_promdes_promocion_descuento_id  = pd.promdes_promocion_descuento_id 
                                        where 
                                            (promdes_tipo_descuento_id = ` + statusControllers.TIPO_PROMOCION['2 X 1'] + ` or promdes_tipo_descuento_id  = ` + statusControllers.TIPO_PROMOCION['3 X 2'] + `)
                                            and
                                                promdes_estatus_id  = ` + statusControllers.ESTATUS_PROMOCION.ACTIVA + `
                                            and
                                            (current_date between  promdes_fecha_inicio_validez and promdes_fecha_finalizacion_validez)
                                            and 
                                                promdes_cupon_descuento  is null
                                    )productos
                                    where productos.prodprom_prod_producto_id = ` + producto.pcdc_prod_producto_id + `;`, 
                                    { type: sequelize.QueryTypes.SELECT });
                                    const mejor_precio =  await sequelize.query(`         
                                    select
                                        case 
                                            when min(mejor_precio.prod_precio) <= 0 then max(mejor_precio.prod_precio) 
                                            else
                                                min(mejor_precio.prod_precio) 
                                        end as min
                                    from (
                                        select 
                                            prod_precio
                                        from productos p 
                                        where prod_producto_id  = ` + producto.pcdc_prod_producto_id + `
                                        union 
                                        select
                                            pldp.pl_precio_producto 
                                        from productos_lista_de_precio pldp 
                                        where pldp.pl_prod_producto_id = ` + producto.pcdc_prod_producto_id + ` and pldp.pl_listp_lista_de_precio_id  = ` + listaPrecio + `
                                    )mejor_precio;`, 
                                    { type: sequelize.QueryTypes.SELECT });
                                    const producto_regalo = await sequelize.query(`
                                    select 
                                    *
                                    from(
                                        select
                                            pd.promdes_sku_gift,
                                            pd.promdes_promocion_descuento_id,
                                            pd.promdes_fecha_inicio_validez, 
                                            pd.promdes_fecha_finalizacion_validez,
                                            pp.prodprom_prod_producto_id,
                                            pd.promdes_tipo_descuento_id 
                                        from promociones_descuentos pd
                                        left join productos_promociones pp  on pp.prodprom_promdes_promocion_descuento_id  = pd.promdes_promocion_descuento_id 
                                        where 
                                            (promdes_tipo_descuento_id = ` + statusControllers.TIPO_PROMOCION['Regalo'] + `)
                                            and
                                                promdes_estatus_id  = `+ statusControllers.ESTATUS_PROMOCION.ACTIVA +`
                                            and
                                            (current_date between  promdes_fecha_inicio_validez and promdes_fecha_finalizacion_validez)
                                            and 
                                                promdes_cupon_descuento  is null
                                    )productos
                                    where productos.prodprom_prod_producto_id = ` + producto.pcdc_prod_producto_id + `;
                                    `, { type: sequelize.QueryTypes.SELECT} );
                                    const mejor_descuento = await sequelize.query(`
                                    select
                                        case 
                                            when max(mejor_descuento.descuento) <= 9 then cast(concat(0, max(mejor_descuento.descuento)) as integer)
                                            else max(mejor_descuento.descuento) 
                                        end as mejor_descuento
                                    from( 
                                        select 
                                            prod_descuento as descuento
                                        from productos p 
                                        where prod_producto_id  = ` + producto.pcdc_prod_producto_id + `
                                        union
                                        select 
                                            m.mar_descuento as descuento
                                        from productos p2 
                                        left join marcas m ON  m.mar_marca_id  = p2.prod_mar_marca_id  
                                        where p2.prod_producto_id  = ` + producto.pcdc_prod_producto_id + `
                                        union 
                                        select 
                                            case 
                                                when sn.sn_descuento >= ldp.listp_descuento then sn.sn_descuento
                                                when ldp.listp_descuento >= sn.sn_descuento then ldp.listp_descuento
                                            end as descuento
                                        from socios_negocio sn 
                                        left join listas_de_precios ldp on ldp.listp_lista_de_precio_id  = sn.sn_socios_negocio_id 
                                        where sn.sn_socios_negocio_id  = ` + socio + `
                                    )mejor_descuento;`, { type: sequelize.QueryTypes.SELECT });
                                    const descuento_porcentaje_or_monto_fijo = await sequelize.query(`
                                    select 
                                        *
                                    from(
                                        select
                                            pd.promdes_tipo_descuento_id,
                                            pd.promdes_promocion_descuento_id,
                                            pd.promdes_descuento_exacto,
                                            pd.promdes_fecha_inicio_validez, 
                                            pd.promdes_fecha_finalizacion_validez,
                                            pp.prodprom_prod_producto_id,
                                            pd.promdes_tipo_descuento_id 
                                        from promociones_descuentos pd
                                        left join productos_promociones pp  on pp.prodprom_promdes_promocion_descuento_id  = pd.promdes_promocion_descuento_id 
                                        where 
                                            (promdes_tipo_descuento_id = ` + statusControllers.TIPO_PROMOCION.Porcentaje + ` or promdes_tipo_descuento_id  = ` + statusControllers.TIPO_PROMOCION['Monto fijo'] + `)
                                            and
                                                promdes_estatus_id  = ` + statusControllers.ESTATUS_PROMOCION.ACTIVA + `
                                            and
                                            (current_date between  promdes_fecha_inicio_validez and promdes_fecha_finalizacion_validez)
                                            and 
                                            promdes_carrito_articulo is true
                                            and 
                                                promdes_cupon_descuento  is null
                                    )productos
                                    where productos.prodprom_prod_producto_id = ` +  producto.pcdc_prod_producto_id + `
                                    `, 
                                    {
                                        type: sequelize.QueryTypes.SELECT
                                    });
                                    if(producto.pcdc_cupon_aplicado == false){
                                        if(producto_con_promocion.length > 0){
                                            let regalados = await cantidadAgregar(producto.pcdc_producto_cantidad, producto_con_promocion[0].promdes_tipo_descuento_id);
                                            let total = await producto.pcdc_producto_cantidad - regalados;
                                            producto_carrito.update({
                                                    pcdc_producto_cantidad: total,
                                                    pcdc_cantidad_producto_promocion: regalados,
                                                    pcdc_prod_producto_id_promocion: producto.pcdc_prod_producto_id,
                                                    pcdc_precio: mejor_precio[0].min,
                                                    pcdc_prod_producto_id_regalo: (producto_regalo.length > 0) ? producto_regalo[0].promdes_sku_gift : null,
                                                    pcdc_cantidad_producto_regalo: (producto_regalo.length > 0) ? producto.pcdc_producto_cantidad : null,
                                                    pcdc_mejor_descuento: (mejor_descuento.length > 0) ?  mejor_descuento[0].mejor_descuento : 0,
                                                    pcdc_tipo_prmocion_individual: (descuento_porcentaje_or_monto_fijo.length > 0) ? descuento_porcentaje_or_monto_fijo[0].promdes_tipo_descuento_id : null,
                                                    pcdc_descuento_promocion: (descuento_porcentaje_or_monto_fijo.length > 0) ? descuento_porcentaje_or_monto_fijo[0].promdes_descuento_exacto : null

                                            });
                                        }else{
                                            producto_carrito.update({
                                                pcdc_precio: mejor_precio[0].min,
                                                pcdc_prod_producto_id_regalo: (producto_regalo.length > 0) ? producto_regalo[0].promdes_sku_gift : null,
                                                pcdc_cantidad_producto_regalo: (producto_regalo.length > 0) ? producto.pcdc_producto_cantidad : null,
                                                pcdc_mejor_descuento: (mejor_descuento.length > 0) ?  mejor_descuento[0].mejor_descuento : 0,
                                                pcdc_tipo_prmocion_individual: (descuento_porcentaje_or_monto_fijo.length > 0) ? descuento_porcentaje_or_monto_fijo[0].promdes_tipo_descuento_id : null,
                                                pcdc_descuento_promocion: (descuento_porcentaje_or_monto_fijo.length > 0) ? descuento_porcentaje_or_monto_fijo[0].promdes_descuento_exacto : null
                                            });
                                        }
                                    }
                                    if((carrito_de_compra.dataValues.productos_carrito_de_compras.length -1) == indexProducto){
                                        //REGRESAMO CARRITO DETALLE
                                        const carrito_de_compra =  await models.CarritoDeCompra.findOne({
                                            where: {
                                                cdc_carrito_de_compra_id: carrito_id
                                            }
                                        });

                                        const productos_carrito_de_compras = await models.ProductoCarritoDeCompra.findAll({
                                            where: {
                                                pcdc_carrito_de_compra_id: carrito_de_compra.dataValues.cdc_carrito_de_compra_id
                                            },
                                            order: [
                                                ['pcdc_prod_producto_id', 'ASC']
                                            ]
                                        });

                                        productos_carrito_de_compras.forEach(async function(producto, indexProducto){
                                            const almacenes_fisicos = await models.Almacenes.findAll({
                                                where: {
                                                    alm_cmm_estatus_id: statusControllers.ESTATUS_ALMACENES.ACTIVA,
                                                    alm_tipo_almacen: statusControllers.TIPO_ALMACEN.FISICO
                                                }
                                            });
                                            const producto_carrito = await models.ProductoCarritoDeCompra.findOne({
                                                where:{
                                                    pcdc_carrito_de_compra_id: producto.dataValues.pcdc_carrito_de_compra_id,
                                                    pcdc_prod_producto_id: producto.dataValues.pcdc_prod_producto_id
                                                }
                                            });
                                            almacenes_fisicos.forEach(async function(almacenFisico, indexAlmacenFisico){
                                                const almacen_origen = await sequelize.query(`
                                                select 
                                                    distinct(total_stock.alm_almacen_id) as almacen,
                                                    total_stock.fisico as fisico,
                                                    case 
                                                        when count(distinct(total_stock.fisico)) = 1  then
                                                            sum(total_stock.sp_cantidad)
                                                        when count(distinct(total_stock.fisico))  > 1 then
                                                            total_stock.sp_cantidad
                                                    end as cantidad,
                                                    total_stock.prod_disponible_backorder
                                                from( 
                                                    ---Almacen Fisico general tercer
                                                    select
                                                        distinct (a.alm_almacen_id),
                                                        a.alm_almacen_id as fisico,
                                                        sp.sp_cantidad,
                                                        p.prod_disponible_backorder
                                                    from almacenes a 
                                                    left join almacenes_logistica al  on al.almlog_almacen_codigo = a."alm_codigoAlmacen" 
                                                    left join stocks_productos sp ON sp.sp_almacen_id = a.alm_almacen_id 
                                                    left join productos p  on p.prod_producto_id  = sp.sp_prod_producto_id 
                                                    where sp.sp_almacen_id = ` + almacenFisico.dataValues.alm_almacen_id + ` and  a.alm_cmm_estatus_id = ` + statusControllers.ESTATUS_ALMACENES.ACTIVA + ` and sp.sp_prod_producto_id  = ` + producto.dataValues.pcdc_prod_producto_id + `
                                                    union 
                                                    ---Almacen virtual asignado a socio
                                                    select
                                                        distinct(a.alm_almacen_id),
                                                        a2.alm_almacen_id as fisico,
                                                        sp.sp_cantidad,
                                                        p2.prod_disponible_backorder
                                                    from almacenes a 
                                                    left join almacenes a2 on a2.alm_almacen_id = a.alm_fisico
                                                    left join stocks_productos sp on sp.sp_almacen_id  = a.alm_almacen_id 
                                                    left join productos p2 on p2.prod_producto_id  = sp.sp_prod_producto_id 
                                                    left join almacenes_logistica al on al.almlog_almacen_codigo = a2."alm_codigoAlmacen" 
                                                    where a.alm_almacen_id  = ` + almacen_virtual + ` and a.alm_cmm_estatus_id = ` + statusControllers.ESTATUS_ALMACENES.ACTIVA + ` and sp.sp_prod_producto_id  = ` + producto.dataValues.pcdc_prod_producto_id + `
                                                )total_stock
                                                group by total_stock.fisico, total_stock.sp_cantidad, total_stock.alm_almacen_id, total_stock.prod_disponible_backorder;
                                                `, 
                                                {
                                                    type: sequelize.QueryTypes.SELECT
                                                });
                                                console.log('RESULTADO CONSULTA ', almacen_origen, almacen_origen[0].cantidad, producto_carrito.dataValues.pcdc_producto_cantidad)
                                                if(Number(almacen_origen[0].cantidad) > producto_carrito.dataValues.pcdc_producto_cantidad && (producto.dataValues.pcdc_validado == false)){
                                                    await producto_carrito.update({
                                                        pcdc_almacen_surtido: almacen_origen[0].fisico,
                                                        pcdc_validado: true
                                                    });
                                                }if((Number(almacen_origen[0].cantidad) < producto_carrito.dataValues.pcdc_producto_cantidad) && (producto.dataValues.pcdc_validado == false)){
                                                    if((almacen_origen[0].prod_disponible_backorder) && (producto.dataValues.pcdc_validado == false)){
                                                        await producto_carrito.update({
                                                            pcdc_back_order: true,
                                                            pcdc_validado: true
                                                        });
                                                    }else if(producto.dataValues.pcdc_validado == false){
                                                        await producto_carrito.update({
                                                            pcdc_no_disponible_para_compra: true,
                                                            pcdc_producto_cantidad: 0,
                                                            pcdc_validado: true
                                                        });
                                                    }
                                                }
                                                if((almacenes_fisicos.length -1) == indexAlmacenFisico){
                                                    if((productos_carrito_de_compras.length -1) == indexProducto){
                                                        
                                                        const productos_carrito_de_compras = await models.ProductoCarritoDeCompra.findAll({
                                                            where: {
                                                                pcdc_carrito_de_compra_id: carrito_de_compra.dataValues.cdc_carrito_de_compra_id
                                                            },
                                                            order: [
                                                                ['pcdc_prod_producto_id', 'ASC']
                                                            ],
                                                            attributes: {
                                                                exclude: ['pcdc_validado']
                                                            },
                                                            include: [
                                                                {
                                                                    model: models.Producto,
                                                                    attributes: {
                                                                        exclude: [
                                                                            'prod_usu_usuario_creado_id',
                                                                            'createdAt',
                                                                            'prod_usu_usuario_modificado_id',
                                                                            'updatedAt',
                                                                            'prod_descripcion_corta',
                                                                            'prod_unidad_medida_venta',
                                                                            'prod_altura',
                                                                            'prod_ancho',
                                                                            'prod_longitud',
                                                                            'prod_peso',
                                                                            'prod_volumen',
                                                                            'prod_total_stock',
                                                                            'prod_proveedor_id',
                                                                            'prod_meta_titulo',
                                                                            'prod_meta_descripcion',
                                                                            'prod_is_kit',
                                                                            'prod_viñetas',
                                                                            'prod_calificacion_promedio',
                                                                            'prod_productos_coleccion_relacionados_id',
                                                                            'prod_productos_coleccion_accesorios_id',
                                                                            'prod_video_url'
                                                                        ]
                                                                    },
                                                                    include: [
                                                                        {
                                                                            model: models.ImagenProducto,
                                                                            attributes: {
                                                                                exclude: [
                                                                                    'imgprod_imagen_producto_id',
                                                                                    'imgprod_usu_usuario_creador_id',
                                                                                    'createdAt',
                                                                                    'updatedAt'
                                                                                ]
                                                                            }
                                                                        }
                                                                    ]
                                                                }
                                                            ]
                                                        });
                                                        res.status(200).send({
                                                            message: 'Producto agregado correctamente.',
                                                            carrito_de_compra,
                                                            productos_carrito_de_compras,
                                                            jsonToProject,
                                                            porcentajeDeAprobacion
                                                        });  
                                                    }
                                                }
                                            });                                                        
                                        }); 
                                    }
                                });
                            }
                        });
                    }else{
                        const carrito_de_compra =  await models.CarritoDeCompra.findOne({
                            where: {
                                cdc_carrito_de_compra_id: carrito_id
                            },
                            include: [
                                {
                                    model: models.ProductoCarritoDeCompra,
                                    attributes: {
                                        exclude: [
                                            'pcdc_producto_carrito_id',
                                            'createdAt',
                                            'updatedAt',
                                        ]
                                    }
                                }
                            ]
                        });
                        carrito_de_compra.dataValues.productos_carrito_de_compras.forEach(async function(producto, indexProducto){
                            const producto_carrito = await models.ProductoCarritoDeCompra.findOne({
                                where: {
                                    pcdc_carrito_de_compra_id: producto.pcdc_carrito_de_compra_id,
                                    pcdc_prod_producto_id: producto.pcdc_prod_producto_id
                                }
                            });
                            
                            //Validamos promociones activas
                            const producto_con_promocion =  await sequelize.query(`         
                            select 
                                *
                            from(
                                select
                                    pd.promdes_promocion_descuento_id,
                                    pd.promdes_fecha_inicio_validez, 
                                    pd.promdes_fecha_finalizacion_validez,
                                    pp.prodprom_prod_producto_id,
                                    pd.promdes_tipo_descuento_id 
                                from promociones_descuentos pd
                                left join productos_promociones pp  on pp.prodprom_promdes_promocion_descuento_id  = pd.promdes_promocion_descuento_id 
                                where 
                                    (promdes_tipo_descuento_id = ` + statusControllers.TIPO_PROMOCION['2 X 1'] + ` or promdes_tipo_descuento_id  = ` + statusControllers.TIPO_PROMOCION['3 X 2'] + `)
                                    and
                                        promdes_estatus_id  = ` + statusControllers.ESTATUS_PROMOCION.ACTIVA + `
                                    and
                                    (current_date between  promdes_fecha_inicio_validez and promdes_fecha_finalizacion_validez)
                                    and 
                                        promdes_cupon_descuento  is null
                            )productos
                            where productos.prodprom_prod_producto_id = ` + producto.pcdc_prod_producto_id + `;`, 
                            { type: sequelize.QueryTypes.SELECT });
                            const mejor_precio =  await sequelize.query(`         
                            select
                                case 
                                    when min(mejor_precio.prod_precio) <= 0 then max(mejor_precio.prod_precio) 
                                    else
                                        min(mejor_precio.prod_precio) 
                                end as min
                            from (
                                select 
                                    prod_precio
                                from productos p 
                                where prod_producto_id  = ` + producto.pcdc_prod_producto_id + `
                                union 
                                select
                                    pldp.pl_precio_producto 
                                from productos_lista_de_precio pldp 
                                where pldp.pl_prod_producto_id = ` + producto.pcdc_prod_producto_id + ` and pldp.pl_listp_lista_de_precio_id  = ` + listaPrecio + `
                            )mejor_precio;`, 
                            { type: sequelize.QueryTypes.SELECT });
                            const producto_regalo = await sequelize.query(`
                            select 
                            *
                            from(
                                select
                                    pd.promdes_sku_gift,
                                    pd.promdes_promocion_descuento_id,
                                    pd.promdes_fecha_inicio_validez, 
                                    pd.promdes_fecha_finalizacion_validez,
                                    pp.prodprom_prod_producto_id,
                                    pd.promdes_tipo_descuento_id 
                                from promociones_descuentos pd
                                left join productos_promociones pp  on pp.prodprom_promdes_promocion_descuento_id  = pd.promdes_promocion_descuento_id 
                                where 
                                    (promdes_tipo_descuento_id = ` + statusControllers.TIPO_PROMOCION['Regalo'] + `)
                                    and
                                        promdes_estatus_id  = `+ statusControllers.ESTATUS_PROMOCION.ACTIVA +`
                                    and
                                    (current_date between  promdes_fecha_inicio_validez and promdes_fecha_finalizacion_validez)
                                    and 
                                        promdes_cupon_descuento  is null
                            )productos
                            where productos.prodprom_prod_producto_id = ` + producto.pcdc_prod_producto_id + `;
                            `, { type: sequelize.QueryTypes.SELECT} );
                            const mejor_descuento = await sequelize.query(`
                            select
                                case 
                                    when max(mejor_descuento.descuento) <= 9 then cast(concat(0, max(mejor_descuento.descuento)) as integer)
                                    else max(mejor_descuento.descuento) 
                                end as mejor_descuento
                            from( 
                                select 
                                    prod_descuento as descuento
                                from productos p 
                                where prod_producto_id  = ` + producto.pcdc_prod_producto_id + `
                                union
                                select 
                                    m.mar_descuento as descuento
                                from productos p2 
                                left join marcas m ON  m.mar_marca_id  = p2.prod_mar_marca_id  
                                where p2.prod_producto_id  = ` + producto.pcdc_prod_producto_id + `
                                union 
                                select 
                                    case 
                                        when sn.sn_descuento >= ldp.listp_descuento then sn.sn_descuento
                                        when ldp.listp_descuento >= sn.sn_descuento then ldp.listp_descuento
                                    end as descuento
                                from socios_negocio sn 
                                left join listas_de_precios ldp on ldp.listp_lista_de_precio_id  = sn.sn_socios_negocio_id 
                                where sn.sn_socios_negocio_id  = ` + socio + `
                            )mejor_descuento;`, { type: sequelize.QueryTypes.SELECT });
                            const descuento_porcentaje_or_monto_fijo = await sequelize.query(`
                            select 
                                *
                            from(
                                select
                                    pd.promdes_tipo_descuento_id,
                                    pd.promdes_promocion_descuento_id,
                                    pd.promdes_descuento_exacto,
                                    pd.promdes_fecha_inicio_validez, 
                                    pd.promdes_fecha_finalizacion_validez,
                                    pp.prodprom_prod_producto_id,
                                    pd.promdes_tipo_descuento_id 
                                from promociones_descuentos pd
                                left join productos_promociones pp  on pp.prodprom_promdes_promocion_descuento_id  = pd.promdes_promocion_descuento_id 
                                where 
                                    (promdes_tipo_descuento_id = ` + statusControllers.TIPO_PROMOCION.Porcentaje + ` or promdes_tipo_descuento_id  = ` + statusControllers.TIPO_PROMOCION['Monto fijo'] + `)
                                    and
                                        promdes_estatus_id  = ` + statusControllers.ESTATUS_PROMOCION.ACTIVA + `
                                    and
                                    (current_date between  promdes_fecha_inicio_validez and promdes_fecha_finalizacion_validez)
                                    and 
                                    promdes_carrito_articulo is true
                                    and 
                                        promdes_cupon_descuento  is null
                            )productos
                            where productos.prodprom_prod_producto_id = ` +  producto.pcdc_prod_producto_id + `
                            `, 
                            {
                                type: sequelize.QueryTypes.SELECT
                            })
                            if(producto.pcdc_cupon_aplicado == false){
                                if(producto_con_promocion.length > 0){
                                    let regalados = await cantidadAgregar(producto.pcdc_producto_cantidad, producto_con_promocion[0].promdes_tipo_descuento_id);
                                    let total = await producto.pcdc_producto_cantidad - regalados;
                                    producto_carrito.update({
                                            pcdc_producto_cantidad: total,
                                            pcdc_prod_producto_id_promocion: producto.pcdc_prod_producto_id,
                                            pcdc_cantidad_producto_promocion: regalados,
                                            pcdc_precio: mejor_precio[0].min,
                                            pcdc_prod_producto_id_regalo: (producto_regalo.length > 0) ? producto_regalo[0].promdes_sku_gift : null,
                                            pcdc_cantidad_producto_regalo: (producto_regalo.length > 0) ? producto.pcdc_producto_cantidad : null,
                                            pcdc_mejor_descuento: (mejor_descuento.length > 0) ?  mejor_descuento[0].mejor_descuento : 0,
                                            pcdc_tipo_prmocion_individual: (descuento_porcentaje_or_monto_fijo.length > 0) ? descuento_porcentaje_or_monto_fijo[0].promdes_tipo_descuento_id : null,
                                            pcdc_descuento_promocion: (descuento_porcentaje_or_monto_fijo.length > 0) ? descuento_porcentaje_or_monto_fijo[0].promdes_descuento_exacto : null

                                    });
                                }else{
                                    producto_carrito.update({
                                        pcdc_precio: mejor_precio[0].min,
                                        pcdc_prod_producto_id_regalo: (producto_regalo.length > 0) ? producto_regalo[0].promdes_sku_gift : null,
                                        pcdc_cantidad_producto_regalo: (producto_regalo.length > 0) ? producto.pcdc_producto_cantidad : null,
                                        pcdc_mejor_descuento: (mejor_descuento.length > 0) ?  mejor_descuento[0].mejor_descuento : 0,
                                        pcdc_tipo_prmocion_individual: (descuento_porcentaje_or_monto_fijo.length > 0) ? descuento_porcentaje_or_monto_fijo[0].promdes_tipo_descuento_id : null,
                                        pcdc_descuento_promocion: (descuento_porcentaje_or_monto_fijo.length > 0) ? descuento_porcentaje_or_monto_fijo[0].promdes_descuento_exacto : null
                                    });
                                }
                            }    
                            if((carrito_de_compra.dataValues.productos_carrito_de_compras.length -1) == indexProducto){
                                //REGRESAMO CARRITO DETALLE
                                const carrito_de_compra =  await models.CarritoDeCompra.findOne({
                                    where: {
                                        cdc_carrito_de_compra_id: carrito_id
                                    }
                                });

                                const productos_carrito_de_compras = await models.ProductoCarritoDeCompra.findAll({
                                    where: {
                                        pcdc_carrito_de_compra_id: carrito_de_compra.dataValues.cdc_carrito_de_compra_id
                                    },
                                    order: [
                                        ['pcdc_prod_producto_id', 'ASC']
                                    ]
                                });

                                productos_carrito_de_compras.forEach(async function(producto, indexProducto){
                                    const almacenes_fisicos = await models.Almacenes.findAll({
                                        where: {
                                            alm_cmm_estatus_id: statusControllers.ESTATUS_ALMACENES.ACTIVA,
                                            alm_tipo_almacen: statusControllers.TIPO_ALMACEN.FISICO
                                        }
                                    });
                                    const producto_carrito = await models.ProductoCarritoDeCompra.findOne({
                                        where:{
                                            pcdc_carrito_de_compra_id: producto.dataValues.pcdc_carrito_de_compra_id,
                                            pcdc_prod_producto_id: producto.dataValues.pcdc_prod_producto_id
                                        }
                                    });
                                    almacenes_fisicos.forEach(async function(almacenFisico, indexAlmacenFisico){
                                        const almacen_origen = await sequelize.query(`
                                        select 
                                            distinct(total_stock.alm_almacen_id) as almacen,
                                            total_stock.fisico as fisico,
                                            case 
                                                when count(distinct(total_stock.fisico)) = 1  then
                                                    sum(total_stock.sp_cantidad)
                                                when count(distinct(total_stock.fisico))  > 1 then
                                                    total_stock.sp_cantidad
                                            end as cantidad,
                                            total_stock.prod_disponible_backorder
                                        from( 
                                            ---Almacen Fisico general tercer
                                            select
                                                distinct (a.alm_almacen_id),
                                                a.alm_almacen_id as fisico,
                                                sp.sp_cantidad,
                                                p.prod_disponible_backorder
                                            from almacenes a 
                                            left join almacenes_logistica al  on al.almlog_almacen_codigo = a."alm_codigoAlmacen" 
                                            left join stocks_productos sp ON sp.sp_almacen_id = a.alm_almacen_id 
                                            left join productos p  on p.prod_producto_id  = sp.sp_prod_producto_id 
                                            where sp.sp_almacen_id = ` + almacenFisico.dataValues.alm_almacen_id + ` and  a.alm_cmm_estatus_id = ` + statusControllers.ESTATUS_ALMACENES.ACTIVA + ` and sp.sp_prod_producto_id  = ` + producto.dataValues.pcdc_prod_producto_id + `
                                            union 
                                            ---Almacen virtual asignado a socio
                                            select
                                                distinct(a.alm_almacen_id),
                                                a2.alm_almacen_id as fisico,
                                                sp.sp_cantidad,
                                                p2.prod_disponible_backorder
                                            from almacenes a 
                                            left join almacenes a2 on a2.alm_almacen_id = a.alm_fisico
                                            left join stocks_productos sp on sp.sp_almacen_id  = a.alm_almacen_id 
                                            left join productos p2 on p2.prod_producto_id  = sp.sp_prod_producto_id 
                                            left join almacenes_logistica al on al.almlog_almacen_codigo = a2."alm_codigoAlmacen" 
                                            where a.alm_almacen_id  = ` + almacen_virtual + ` and a.alm_cmm_estatus_id = ` + statusControllers.ESTATUS_ALMACENES.ACTIVA + ` and sp.sp_prod_producto_id  = ` + producto.dataValues.pcdc_prod_producto_id + `
                                        )total_stock
                                        group by total_stock.fisico, total_stock.sp_cantidad, total_stock.alm_almacen_id, total_stock.prod_disponible_backorder;
                                        `, 
                                        {
                                            type: sequelize.QueryTypes.SELECT
                                        });
                                        console.log('RESULTADO CONSULTA ', almacen_origen, almacen_origen[0].cantidad, producto_carrito.dataValues.pcdc_producto_cantidad)
                                        if(Number(almacen_origen[0].cantidad) > producto_carrito.dataValues.pcdc_producto_cantidad && (producto.dataValues.pcdc_validado == false)){
                                            await producto_carrito.update({
                                                pcdc_almacen_surtido: almacen_origen[0].fisico,
                                                pcdc_validado: true
                                            });
                                        }if((Number(almacen_origen[0].cantidad) < producto_carrito.dataValues.pcdc_producto_cantidad) && (producto.dataValues.pcdc_validado == false)){
                                            if((almacen_origen[0].prod_disponible_backorder) && (producto.dataValues.pcdc_validado == false)){
                                                await producto_carrito.update({
                                                    pcdc_back_order: true,
                                                    pcdc_validado: true
                                                });
                                            }else if(producto.dataValues.pcdc_validado == false){
                                                await producto_carrito.update({
                                                    pcdc_no_disponible_para_compra: true,
                                                    pcdc_producto_cantidad: 0,
                                                    pcdc_validado: true
                                                });
                                            }
                                        }
                                        if((almacenes_fisicos.length -1) == indexAlmacenFisico){
                                            if((productos_carrito_de_compras.length -1) == indexProducto){
                                                
                                                const productos_carrito_de_compras = await models.ProductoCarritoDeCompra.findAll({
                                                    where: {
                                                        pcdc_carrito_de_compra_id: carrito_de_compra.dataValues.cdc_carrito_de_compra_id
                                                    },
                                                    order: [
                                                        ['pcdc_prod_producto_id', 'ASC']
                                                    ],
                                                    attributes: {
                                                        exclude: ['pcdc_validado']
                                                    },
                                                    include: [
                                                        {
                                                            model: models.Producto,
                                                            attributes: {
                                                                exclude: [
                                                                    'prod_usu_usuario_creado_id',
                                                                    'createdAt',
                                                                    'prod_usu_usuario_modificado_id',
                                                                    'updatedAt',
                                                                    'prod_descripcion_corta',
                                                                    'prod_unidad_medida_venta',
                                                                    'prod_altura',
                                                                    'prod_ancho',
                                                                    'prod_longitud',
                                                                    'prod_peso',
                                                                    'prod_volumen',
                                                                    'prod_total_stock',
                                                                    'prod_proveedor_id',
                                                                    'prod_meta_titulo',
                                                                    'prod_meta_descripcion',
                                                                    'prod_is_kit',
                                                                    'prod_viñetas',
                                                                    'prod_calificacion_promedio',
                                                                    'prod_productos_coleccion_relacionados_id',
                                                                    'prod_productos_coleccion_accesorios_id',
                                                                    'prod_video_url'
                                                                ]
                                                            },
                                                            include: [
                                                                {
                                                                    model: models.ImagenProducto,
                                                                    attributes: {
                                                                        exclude: [
                                                                            'imgprod_imagen_producto_id',
                                                                            'imgprod_usu_usuario_creador_id',
                                                                            'createdAt',
                                                                            'updatedAt'
                                                                        ]
                                                                    }
                                                                }
                                                            ]
                                                        }
                                                    ]
                                                });
                                                res.status(200).send({
                                                    message: 'Producto agregado correctamente.',
                                                    carrito_de_compra,
                                                    productos_carrito_de_compras,
                                                    jsonToProject,
                                                    porcentajeDeAprobacion
                                                });  
                                            }
                                        }
                                    });                                                        
                                });  
                            }
                        });
                    }
                }
            }else{
                res.status(300).send({
                    message: 'Carrito de compras no existe o no disponible'
                });
            }
        }catch(e){
            res.status(500).send({
                message: 'Error al obtener carrito',
                e
            });
            next(e);
        }
    },
    //Aplicamos cupón
    applyCoupon: async(req, res, next) =>{
        try{
            let carritoApplyCoupon = await models.CarritoDeCompra.findOne({
                where: {
                    cdc_carrito_de_compra_id: req.params.id
                }
            });
            const listaPrecio = !!carritoApplyCoupon.cdc_lista_precio ? carritoApplyCoupon.cdc_lista_precio : 0;
            const socio = !!carritoApplyCoupon.cdc_sn_socio_de_negocio_id ? carritoApplyCoupon.cdc_sn_socio_de_negocio_id : 0;
            const carrito_id = !!carritoApplyCoupon.cdc_carrito_de_compra_id ? carritoApplyCoupon.cdc_carrito_de_compra_id : 0;
            if(carritoApplyCoupon){
                if(!carritoApplyCoupon.dataValues.cdc_with_coupon){
                    const cuponExistente = await sequelize.query(`
                    select 
                        *
                    from promociones_descuentos pd 
                    left join productos_promociones pp on pp.prodprom_promdes_promocion_descuento_id  = pd.promdes_promocion_descuento_id 
                    where
                        pd.promdes_cupon_descuento = '` + req.body.promdes_cupon_descuento + `' 
                    and 
                        current_date  between pd.promdes_fecha_inicio_validez and pd.promdes_fecha_finalizacion_validez;`, 
                    {
                        type: sequelize.QueryTypes.SELECT
                    });
                    
                    if(cuponExistente.length > 0){
                        const carrito_de_compra =  await models.CarritoDeCompra.findOne({
                            where: {
                                cdc_carrito_de_compra_id: carrito_id
                            },
                            include: [
                                {
                                    model: models.ProductoCarritoDeCompra,
                                    attributes: {
                                        exclude: [
                                            'pcdc_producto_carrito_id',
                                            'createdAt',
                                            'updatedAt',
                                        ]
                                    }
                                }
                            ]
                        });
                        let jsonToProject = [];
                        carrito_de_compra.dataValues.productos_carrito_de_compras.forEach(async function(producto, indexProducto){
                            const producto_carrito = await models.ProductoCarritoDeCompra.findOne({
                                where: {
                                    pcdc_carrito_de_compra_id: producto.pcdc_carrito_de_compra_id,
                                    pcdc_prod_producto_id: producto.pcdc_prod_producto_id
                                }
                            });
                            
                            //Validamos promociones activas
                            const producto_con_promocion =  await sequelize.query(`         
                            select 
                                *
                            from(
                                select
                                    pd.promdes_promocion_descuento_id,
                                    pd.promdes_fecha_inicio_validez, 
                                    pd.promdes_fecha_finalizacion_validez,
                                    pp.prodprom_prod_producto_id,
                                    pd.promdes_tipo_descuento_id 
                                from promociones_descuentos pd
                                left join productos_promociones pp  on pp.prodprom_promdes_promocion_descuento_id  = pd.promdes_promocion_descuento_id 
                                where 
                                    (promdes_tipo_descuento_id = ` + statusControllers.TIPO_PROMOCION['2 X 1'] + ` or promdes_tipo_descuento_id  = ` + statusControllers.TIPO_PROMOCION['3 X 2'] + `)
                                    and 
                                        promdes_cupon_descuento =  '` + req.body.promdes_cupon_descuento + `' 
                            )productos
                            where productos.prodprom_prod_producto_id = ` + producto.pcdc_prod_producto_id + `;`, 
                            { type: sequelize.QueryTypes.SELECT });
                            const mejor_precio =  await sequelize.query(`         
                            select
                                case 
                                    when min(mejor_precio.prod_precio) <= 0 then max(mejor_precio.prod_precio) 
                                    else
                                        min(mejor_precio.prod_precio) 
                                end as min
                            from (
                                select 
                                    prod_precio
                                from productos p 
                                where prod_producto_id  = ` + producto.pcdc_prod_producto_id + `
                                union 
                                select
                                    pldp.pl_precio_producto 
                                from productos_lista_de_precio pldp 
                                where pldp.pl_prod_producto_id = ` + producto.pcdc_prod_producto_id + ` and pldp.pl_listp_lista_de_precio_id  = ` + listaPrecio + `
                            )mejor_precio;`, 
                            { type: sequelize.QueryTypes.SELECT });
                            const producto_regalo = await sequelize.query(`
                            select 
                            *
                            from(
                                select
                                    pd.promdes_sku_gift,
                                    pd.promdes_promocion_descuento_id,
                                    pd.promdes_fecha_inicio_validez, 
                                    pd.promdes_fecha_finalizacion_validez,
                                    pp.prodprom_prod_producto_id,
                                    pd.promdes_tipo_descuento_id 
                                from promociones_descuentos pd
                                left join productos_promociones pp  on pp.prodprom_promdes_promocion_descuento_id  = pd.promdes_promocion_descuento_id 
                                where 
                                    (promdes_tipo_descuento_id = ` + statusControllers.TIPO_PROMOCION['Regalo'] + `)
                                    and
                                        promdes_estatus_id  = `+ statusControllers.ESTATUS_PROMOCION.ACTIVA +`
                                    and
                                    (current_date between  promdes_fecha_inicio_validez and promdes_fecha_finalizacion_validez)
                                    and 
                                        promdes_cupon_descuento  = '` + req.body.promdes_cupon_descuento + `' 
                            )productos
                            where productos.prodprom_prod_producto_id = ` + producto.pcdc_prod_producto_id + `;
                            `, { type: sequelize.QueryTypes.SELECT} );
                            const mejor_descuento = await sequelize.query(`
                            select
                                case 
                                    when max(mejor_descuento.descuento) <= 9 then cast(concat(0, max(mejor_descuento.descuento)) as integer)
                                    else max(mejor_descuento.descuento) 
                                end as mejor_descuento
                            from( 
                                select 
                                    prod_descuento as descuento
                                from productos p 
                                where prod_producto_id  = ` + producto.pcdc_prod_producto_id + `
                                union
                                select 
                                    m.mar_descuento as descuento
                                from productos p2 
                                left join marcas m ON  m.mar_marca_id  = p2.prod_mar_marca_id  
                                where p2.prod_producto_id  = ` + producto.pcdc_prod_producto_id + `
                                union 
                                select 
                                    case 
                                        when sn.sn_descuento >= ldp.listp_descuento then sn.sn_descuento
                                        when ldp.listp_descuento >= sn.sn_descuento then ldp.listp_descuento
                                    end as descuento
                                from socios_negocio sn 
                                left join listas_de_precios ldp on ldp.listp_lista_de_precio_id  = sn.sn_socios_negocio_id 
                                where sn.sn_socios_negocio_id  = ` + socio + `
                            )mejor_descuento;`, { type: sequelize.QueryTypes.SELECT });
                            const descuento_porcentaje_or_monto_fijo = await sequelize.query(`
                            select 
                                *
                            from(
                                select
                                    pd.promdes_tipo_descuento_id,
                                    pd.promdes_promocion_descuento_id,
                                    pd.promdes_descuento_exacto,
                                    pd.promdes_fecha_inicio_validez, 
                                    pd.promdes_fecha_finalizacion_validez,
                                    pp.prodprom_prod_producto_id,
                                    pd.promdes_tipo_descuento_id 
                                from promociones_descuentos pd
                                left join productos_promociones pp  on pp.prodprom_promdes_promocion_descuento_id  = pd.promdes_promocion_descuento_id 
                                where 
                                    (promdes_tipo_descuento_id = ` + statusControllers.TIPO_PROMOCION.Porcentaje + ` or promdes_tipo_descuento_id  = ` + statusControllers.TIPO_PROMOCION['Monto fijo'] + `)
                                    and
                                        promdes_estatus_id  = ` + statusControllers.ESTATUS_PROMOCION.ACTIVA + `
                                    and
                                    promdes_carrito_articulo is true
                                    and 
                                        promdes_cupon_descuento  = '` + req.body.promdes_cupon_descuento + `' 
                            )productos
                            where productos.prodprom_prod_producto_id = ` +  producto.pcdc_prod_producto_id + `
                            `, 
                            {
                                type: sequelize.QueryTypes.SELECT
                            });
                            if(producto_con_promocion.length > 0){
                                let regalados = await cantidadAgregar(producto.pcdc_producto_cantidad, producto_con_promocion[0].promdes_tipo_descuento_id);
                                let total = await producto.pcdc_producto_cantidad - regalados;
                                producto_carrito.update({
                                        pcdc_producto_cantidad: total,
                                        pcdc_cantidad_producto_promocion: regalados,
                                        pcdc_prod_producto_id_promocion: producto.pcdc_prod_producto_id,
                                        pcdc_precio: mejor_precio[0].min,
                                        pcdc_prod_producto_id_regalo: (producto_regalo.length > 0) ? producto_regalo[0].promdes_sku_gift : null,
                                        pcdc_cantidad_producto_regalo: (producto_regalo.length > 0) ? producto.pcdc_producto_cantidad : null,
                                        pcdc_mejor_descuento: (mejor_descuento.length > 0) ?  mejor_descuento[0].mejor_descuento : 0,
                                        pcdc_tipo_prmocion_individual: (descuento_porcentaje_or_monto_fijo.length > 0) ? descuento_porcentaje_or_monto_fijo[0].promdes_tipo_descuento_id : null,
                                        pcdc_descuento_promocion: (descuento_porcentaje_or_monto_fijo.length > 0) ? descuento_porcentaje_or_monto_fijo[0].promdes_descuento_exacto : null,
                                        pcdc_cupon_aplicado: true

                                });
                            }else{
                                producto_carrito.update({
                                    pcdc_precio: mejor_precio[0].min,
                                    pcdc_prod_producto_id_regalo: (producto_regalo.length > 0) ? producto_regalo[0].promdes_sku_gift : null,
                                    pcdc_cantidad_producto_regalo: (producto_regalo.length > 0) ? producto.pcdc_producto_cantidad : null,
                                    pcdc_mejor_descuento: (mejor_descuento.length > 0) ?  mejor_descuento[0].mejor_descuento : 0,
                                    pcdc_tipo_prmocion_individual: (descuento_porcentaje_or_monto_fijo.length > 0) ? descuento_porcentaje_or_monto_fijo[0].promdes_tipo_descuento_id : null,
                                    pcdc_descuento_promocion: (descuento_porcentaje_or_monto_fijo.length > 0) ? descuento_porcentaje_or_monto_fijo[0].promdes_descuento_exacto : null,
                                    pcdc_cupon_aplicado: true
                                });
                            }
                            if((carrito_de_compra.dataValues.productos_carrito_de_compras.length -1) == indexProducto){
                                const carrito_de_compra =  await models.CarritoDeCompra.findOne({
                                    where: {
                                        cdc_carrito_de_compra_id: carrito_id
                                    }
                                });

                                const productos_de_proyecto = await sequelize.query(`
                                select
                                    distinct(pc.pc_prod_producto_id) as producto 
                                from cotizaciones_proyectos cp 
                                inner join productos_cotizaciones pc on pc.pc_cot_cotizacion_id = cp.cot_cotizacion_id
                                where 
                                    cp.cot_cmm_estatus_id  = ` + statusControllers.ESTATUS_COTIZACION_PROYECTO.ACTIVO + `
                                    and
                                    current_date between  current_date and cp.cot_fecha_vencimiento 
                                    and 
                                    cp.cot_sn_socios_negocio_id  = ` + socio + `;
                                `, {
                                    type: sequelize.QueryTypes.SELECT
                                });
                                let idsProyectos = [];
                                await productos_de_proyecto.forEach(async function(proyecto, indexProyecto){
                                    idsProyectos.push(proyecto.producto);
                                });
                                let to_ids = await idsProyectos.length > 0 ? idsProyectos : 0 ;
                                const productos_de_carrito_total = await sequelize.query(`
                                select
                                    count(distinct(pcdc.pcdc_prod_producto_id)) as incluidos
                                from carrito_de_compras cdc 
                                inner join productos_carrito_de_compra pcdc on pcdc.pcdc_carrito_de_compra_id  = cdc.cdc_carrito_de_compra_id 
                                where 
                                    cdc.cdc_carrito_de_compra_id  = ` + carrito_id + `
                                    and
                                    pcdc.pcdc_prod_producto_id  in (` + to_ids + `);            
                                `, {
                                    type: sequelize.QueryTypes.SELECT
                                });
        
                                const productos_de_carrito = await sequelize.query(`
                                select
                                    count(distinct(pcdc.pcdc_prod_producto_id)) as total
                                from carrito_de_compras cdc 
                                inner join productos_carrito_de_compra pcdc on pcdc.pcdc_carrito_de_compra_id  = cdc.cdc_carrito_de_compra_id 
                                where 
                                    cdc.cdc_carrito_de_compra_id  = ` + carrito_id + `;            
                                `, {
                                    type: sequelize.QueryTypes.SELECT
                                });
        
                                let porcentajeDeAprobacion = await Number(((Number(productos_de_carrito_total[0].incluidos) / Number(productos_de_carrito[0].total)) * 100).toFixed(2));

                                //REGRESAMO CARRITO DETALLE
                               

                                const productos_carrito_de_compras = await models.ProductoCarritoDeCompra.findAll({
                                    where: {
                                        pcdc_carrito_de_compra_id: carrito_de_compra.dataValues.cdc_carrito_de_compra_id
                                    },
                                    order: [
                                        ['pcdc_prod_producto_id', 'ASC']
                                    ]
                                });

                                productos_carrito_de_compras.forEach(async function(producto, indexProducto){
                                    const almacenes_fisicos = await models.Almacenes.findAll({
                                        where: {
                                            alm_cmm_estatus_id: statusControllers.ESTATUS_ALMACENES.ACTIVA,
                                            alm_tipo_almacen: statusControllers.TIPO_ALMACEN.FISICO
                                        }
                                    });
                                    const producto_carrito = await models.ProductoCarritoDeCompra.findOne({
                                        where:{
                                            pcdc_carrito_de_compra_id: producto.dataValues.pcdc_carrito_de_compra_id,
                                            pcdc_prod_producto_id: producto.dataValues.pcdc_prod_producto_id
                                        }
                                    });
                                    almacenes_fisicos.forEach(async function(almacenFisico, indexAlmacenFisico){
                                        const almacen_origen = await sequelize.query(`
                                        select 
                                            distinct(total_stock.alm_almacen_id) as almacen,
                                            total_stock.fisico as fisico,
                                            case 
                                                when count(distinct(total_stock.fisico)) = 1  then
                                                    sum(total_stock.sp_cantidad)
                                                when count(distinct(total_stock.fisico))  > 1 then
                                                    total_stock.sp_cantidad
                                            end as cantidad,
                                            total_stock.prod_disponible_backorder
                                        from( 
                                            ---Almacen Fisico general tercer
                                            select
                                                distinct (a.alm_almacen_id),
                                                a.alm_almacen_id as fisico,
                                                sp.sp_cantidad,
                                                p.prod_disponible_backorder
                                            from almacenes a 
                                            left join almacenes_logistica al  on al.almlog_almacen_codigo = a."alm_codigoAlmacen" 
                                            left join stocks_productos sp ON sp.sp_almacen_id = a.alm_almacen_id 
                                            left join productos p  on p.prod_producto_id  = sp.sp_prod_producto_id 
                                            where sp.sp_almacen_id = ` + almacenFisico.dataValues.alm_almacen_id + ` and  a.alm_cmm_estatus_id = ` + statusControllers.ESTATUS_ALMACENES.ACTIVA + ` and sp.sp_prod_producto_id  = ` + producto.dataValues.pcdc_prod_producto_id + `
                                            union 
                                            ---Almacen virtual asignado a socio
                                            select
                                                distinct(a.alm_almacen_id),
                                                a2.alm_almacen_id as fisico,
                                                sp.sp_cantidad,
                                                p2.prod_disponible_backorder
                                            from almacenes a 
                                            left join almacenes a2 on a2.alm_almacen_id = a.alm_fisico
                                            left join stocks_productos sp on sp.sp_almacen_id  = a.alm_almacen_id 
                                            left join productos p2 on p2.prod_producto_id  = sp.sp_prod_producto_id 
                                            left join almacenes_logistica al on al.almlog_almacen_codigo = a2."alm_codigoAlmacen" 
                                            where a.alm_almacen_id  = ` + almacen_virtual + ` and a.alm_cmm_estatus_id = ` + statusControllers.ESTATUS_ALMACENES.ACTIVA + ` and sp.sp_prod_producto_id  = ` + producto.dataValues.pcdc_prod_producto_id + `
                                        )total_stock
                                        group by total_stock.fisico, total_stock.sp_cantidad, total_stock.alm_almacen_id, total_stock.prod_disponible_backorder;
                                        `, 
                                        {
                                            type: sequelize.QueryTypes.SELECT
                                        });
                                        console.log('RESULTADO CONSULTA ', almacen_origen, almacen_origen[0].cantidad, producto_carrito.dataValues.pcdc_producto_cantidad)
                                        if(Number(almacen_origen[0].cantidad) > producto_carrito.dataValues.pcdc_producto_cantidad && (producto.dataValues.pcdc_validado == false)){
                                            await producto_carrito.update({
                                                pcdc_almacen_surtido: almacen_origen[0].fisico,
                                                pcdc_validado: true
                                            });
                                        }if((Number(almacen_origen[0].cantidad) < producto_carrito.dataValues.pcdc_producto_cantidad) && (producto.dataValues.pcdc_validado == false)){
                                            if((almacen_origen[0].prod_disponible_backorder) && (producto.dataValues.pcdc_validado == false)){
                                                await producto_carrito.update({
                                                    pcdc_back_order: true,
                                                    pcdc_validado: true
                                                });
                                            }else if(producto.dataValues.pcdc_validado == false){
                                                await producto_carrito.update({
                                                    pcdc_no_disponible_para_compra: true,
                                                    pcdc_producto_cantidad: 0,
                                                    pcdc_validado: true
                                                });
                                            }
                                        }
                                        if((almacenes_fisicos.length -1) == indexAlmacenFisico){
                                            if((productos_carrito_de_compras.length -1) == indexProducto){
                                                
                                                const productos_carrito_de_compras = await models.ProductoCarritoDeCompra.findAll({
                                                    where: {
                                                        pcdc_carrito_de_compra_id: carrito_de_compra.dataValues.cdc_carrito_de_compra_id
                                                    },
                                                    order: [
                                                        ['pcdc_prod_producto_id', 'ASC']
                                                    ],
                                                    attributes: {
                                                        exclude: ['pcdc_validado']
                                                    },
                                                    include: [
                                                        {
                                                            model: models.Producto,
                                                            attributes: {
                                                                exclude: [
                                                                    'prod_usu_usuario_creado_id',
                                                                    'createdAt',
                                                                    'prod_usu_usuario_modificado_id',
                                                                    'updatedAt',
                                                                    'prod_descripcion_corta',
                                                                    'prod_unidad_medida_venta',
                                                                    'prod_altura',
                                                                    'prod_ancho',
                                                                    'prod_longitud',
                                                                    'prod_peso',
                                                                    'prod_volumen',
                                                                    'prod_total_stock',
                                                                    'prod_proveedor_id',
                                                                    'prod_meta_titulo',
                                                                    'prod_meta_descripcion',
                                                                    'prod_is_kit',
                                                                    'prod_viñetas',
                                                                    'prod_calificacion_promedio',
                                                                    'prod_productos_coleccion_relacionados_id',
                                                                    'prod_productos_coleccion_accesorios_id',
                                                                    'prod_video_url'
                                                                ]
                                                            },
                                                            include: [
                                                                {
                                                                    model: models.ImagenProducto,
                                                                    attributes: {
                                                                        exclude: [
                                                                            'imgprod_imagen_producto_id',
                                                                            'imgprod_usu_usuario_creador_id',
                                                                            'createdAt',
                                                                            'updatedAt'
                                                                        ]
                                                                    }
                                                                }
                                                            ]
                                                        }
                                                    ]
                                                });
                                                res.status(200).send({
                                                    message: 'Producto agregado correctamente.',
                                                    carrito_de_compra,
                                                    productos_carrito_de_compras,
                                                    jsonToProject,
                                                    porcentajeDeAprobacion
                                                });  
                                            }
                                        }
                                    });                                                        
                                });
                            }
                        });
                    }else{
                        res.status(300).send({
                            message: 'Error, el cupón no existe'
                        });
                    }
                }else{
                    res.status(300).send({
                        message: 'Error al aplicar cupón, el carrito ya cuenta con un cupón'
                    });
                }
            }else{
                res.status(300).send({
                    message: 'Error al aplicar cupón, el carrito actual no existe'
                });
            }
        }catch(e){
            res.status(500).send({
                message: 'Error al agregar cupón',
                e
            });
            next(e);
        }
    },
    converterCarShopToCotizacionProyecto: async (req, res, next) =>{
        try{
            const carrito_de_compra = await models.CarritoDeCompra.findOne({
                where : {
                    cdc_carrito_de_compra_id: req.body.cdc_carrito_de_compra_id
                },
                include: [
                    {
                        model: models.ProductoCarritoDeCompra
                    }
                ]
            });
            const total_compra = await sequelize.query(`
                select 
                    sum(total.total)
                from(
                select 
                    case 
                        when pcdc.pcdc_mejor_descuento >= 10 then   (pcdc.pcdc_precio - (pcdc.pcdc_precio * cast(concat('0.' || pcdc.pcdc_mejor_descuento) as float))) * pcdc.pcdc_producto_cantidad
                        when pcdc.pcdc_mejor_descuento <= 9 then    (pcdc.pcdc_precio - (pcdc.pcdc_precio * cast(concat('0.0' || pcdc.pcdc_mejor_descuento) as float))) * pcdc.pcdc_producto_cantidad
                    end as total
                from carrito_de_compras cdc  
                left join productos_carrito_de_compra pcdc  on pcdc.pcdc_carrito_de_compra_id  = cdc.cdc_carrito_de_compra_id 
                where cdc.cdc_carrito_de_compra_id  = ` + carrito_de_compra.dataValues.cdc_carrito_de_compra_id + `
                )total
            `,
            {
                type: sequelize.QueryTypes.SELECT
            });
            let total_de_la_compra = total_compra.length > 0 ? total_compra[0].sum : 0

            let cotizacion = {
                cot_numero_orden: carrito_de_compra.dataValues.cdc_numero_orden,
                cot_proyecto_nombre: !!req.body.cot_proyecto_nombre ? req.body.cot_proyecto_nombre : null,
                cot_cmm_tipo_id: req.body.cot_cmm_tipo_id,
                cot_cmm_estatus_id: req.body.cot_cmm_estatus_id,
                cot_sn_socios_negocio_id: carrito_de_compra.dataValues.cdc_sn_socio_de_negocio_id,
                cot_usu_usuario_vendedor_id: req.body.cot_usu_usuario_vendedor_id,
                cot_fecha_vencimiento: req.body.cot_fecha_vencimiento,
                cot_comentario: !!req.body.cot_comentario ? req.body.cot_comentario : null,
                cot_descuento: !!req.body.cot_descuento ? req.body.cot_descuento : null,
                cot_correo_electronico: !!req.body.cot_correo_electronico ? req.body.cot_correo_electronico : null,
                cot_total_cotizacion: total_de_la_compra,
                cot_fecha_envio: !!req.body.cot_fecha_envio ? req.body.cot_fecha_envio : null
            }
            const cotizacion_proyecto = await models.CotizacionProyecto.create(cotizacion);
            if(cotizacion_proyecto){
                if(carrito_de_compra.dataValues.productos_carrito_de_compras.length > 0){
                    carrito_de_compra.dataValues.productos_carrito_de_compras.forEach(async function(producto, indexProducto){
                        let productoCotizacion = {
                            pc_cot_cotizacion_id: cotizacion_proyecto.dataValues.cot_cotizacion_id,
                            pc_prod_producto_id: producto.dataValues.pcdc_prod_producto_id,
                            pc_cantidad_producto: producto.dataValues.pcdc_producto_cantidad,
                            pc_mejor_descuento: producto.dataValues.pcdc_mejor_descuento,
                            pc_precio: producto.dataValues.pcdc_precio
                        }
                        await models.ProductosCotizacionProyecto.create(productoCotizacion);
                        if((carrito_de_compra.dataValues.productos_carrito_de_compras.length -1) == indexProducto){
                            const cotizacion = await models.CotizacionProyecto.findOne({
                                where: {
                                    cot_cotizacion_id: cotizacion_proyecto.dataValues.cot_cotizacion_id
                                }
                            });
                            const productos = await models.ProductosCotizacionProyecto.findAll({
                                where: {
                                    pc_cot_cotizacion_id: cotizacion_proyecto.dataValues.cot_cotizacion_id
                                },
                                include: [
                                    {
                                        model: models.Producto,
                                        include: [
                                            {
                                                model: models.ImagenProducto
                                            }
                                        ]
                                    }
                                ]
                            });
                            await models.ProductoCarritoDeCompra.destroy({
                                where: {
                                    pcdc_carrito_de_compra_id: req.body.cdc_carrito_de_compra_id
                                }
                            });
                            await models.CarritoDeCompra.destroy({
                                where : {
                                    cdc_carrito_de_compra_id: req.body.cdc_carrito_de_compra_id
                                }
                            });
                            res.status(200).send({
                                message: 'Cotización/Proyecto creado extisoamente',
                                cotizacion,
                                productos
                            });
                        }
                    });
                }else{
                    await cotizacion_proyecto.destroy();
                    res.status(300).send({
                        message: 'Error al crear cotización, carrito vacio'
                    });
                }
            }else{
                res.status(300).send({
                    message: 'Error al crear cotización'
                })
            }
        }catch(e){
            res.status(500).send({
                message: 'Error al crear cotización',
                e
            });
            next(e);
        }
    }
}