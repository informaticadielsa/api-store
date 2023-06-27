import models from '../models';
import statusControles from '../mapeos/mapeoControlesMaestrosMultiples';
const { Op } = require("sequelize");
import {  Sequelize } from 'sequelize';
import XLSX from  'xlsx';

const sequelize = new Sequelize(process.env.POSTGRESQL);
export default {
   


    //Recuperar General Informacion Atributos y relaciones

      
        //Recupera la informacion solamente de los atributos por id de categoria
        getCategoriasAtributos: async(req, res, next) =>{
            try{

                //console.log(req.body.prod_producto_id);

                //Obtener todas las relaciones de categorias con atributos
                const constCategoria = await models.Categoria.findOne(
                {
                    where: {
                        cat_categoria_id: req.body.cat_categoria_id
                    },
                    attributes: {exclude: ['createdAt', 'updatedAt']}
                });

                var responseFinal = 'Lista Completa';

                //Si la categoria existe se buscara sus relaciones con atributos
                if(constCategoria)
                {
                    //Busca el total de relaciones que tiene una categoria en categorias-atributos tabla
                    const constAtributoCategorias = await models.AtributoCategorias.findAll(
                    {
                        where: {
                            atc_id_categoria: constCategoria.dataValues.cat_categoria_id,
                            atc_cmm_estatus_id: { [Op.ne] : statusControles.ATRIBUTO_CATEGORIAS.ELIMINADA }
                        },
                        attributes: {exclude: ['createdAt', 'updatedAt']}
                    });

                    //Arreglo que contendra todos los atributos de categoria
                    var arrayAtributosCategorias = [];

                    //Del total de relaciones hara un 
                    for (var i = 0; i < constAtributoCategorias.length; i++) 
                    {
                        //console.log(constAtributoCategorias[i].dataValues)
                        
                        //Buscar Atributos datos
                        const constAtributo = await models.Atributo.findOne(
                        {
                            where: {
                                at_atributo_id: constAtributoCategorias[i].dataValues.atc_id_atributo
                            },
                            attributes: {exclude: ['createdAt', 'updatedAt']}
                        });

                        //console.log(constAtributo)
                        //Variable para Lineas
                        var jsonArray = {
                            "atc_atributos_categorias_id": constAtributoCategorias[i].dataValues.atc_atributos_categorias_id,
                            "atc_id_atributo": constAtributoCategorias[i].dataValues.atc_id_atributo,
                            "at_nombre": constAtributo.at_nombre,
                            "at_atributo_id": constAtributo.at_atributo_id,
                            "at_descripcion": constAtributo.at_descripcion,
                            "atc_cmm_estatus_id": constAtributoCategorias[i].dataValues.atc_cmm_estatus_id
                        }
                        arrayAtributosCategorias.push(jsonArray);


                    } //Fin for

                    var responseFinal = {
                        "cat_categoria_id": constCategoria.cat_categoria_id,
                        "cat_nombre": constCategoria.cat_nombre,
                        "atributos_categorias_lista": arrayAtributosCategorias
                    }


                }
                else //No Existe la categoria
                {
                    responseFinal = 'La categoria no existe';
                }


                res.status(200).send({
                    message: responseFinal,
                    //constAtributoCategorias
                })
            }catch(e){
                res.status(500).send({
                    message: 'Error en la petición',
                    e
                });
                next(e);
            }
        },

        //Recupera la informacion atributos categorias a partir de un id de SKU PADRE
        getProductoAtributosCategoriasValores: async(req, res, next) =>{
            try{

                //console.log(req.body.prod_producto_id);

                //Validar que sea producto padre
                const constProducto = await models.Producto.findOne(
                {
                    where: {
                        prod_producto_id: req.body.prod_producto_id,
                        prod_prod_producto_padre_sku: null 
                    },
                    attributes: {exclude: ['createdAt', 'updatedAt']}
                });

                var mensajeFinal = 'Lista Completa';

                //Si el producto es padre y existe buscara sus atributos de categoria con valores.
                if(constProducto)
                {
                    
                    //Busca el total de relaciones que tiene una categoria en categorias-atributos tabla
                    const constAtributoCategorias = await models.AtributoCategorias.findAll(
                    {
                        where: {
                            atc_id_categoria: constProducto.prod_cat_categoria_id,
                            atc_cmm_estatus_id: { [Op.ne] : statusControles.ATRIBUTO_CATEGORIAS.ELIMINADA }
                        },
                        attributes: {exclude: ['createdAt', 'updatedAt']}
                    });

                    //Busca la informacion de las categorias
                    const constCategoria = await models.Categoria.findOne(
                    {
                        where: {
                            cat_categoria_id: constProducto.prod_cat_categoria_id
                        },
                        attributes: {exclude: ['createdAt', 'updatedAt']}
                    });

                    //Crear arreglo del total de atributos con valor
                    var arrayAtributosCategorias = [];

                    //Tomara el total de veces que aparesca el id del atributo categoria en la tabla atributos-categorias
                    for (var i = 0; i < constAtributoCategorias.length; i++) 
                    {
                        //console.log(constAtributoCategorias[i])


                        //obtiene los valores por categoria
                        const constAtributoProductosValores = await models.AtributoProductosValores.findOne(
                        {
                            where: {
                                pav_atributo_categoria: constAtributoCategorias[i].dataValues.atc_atributos_categorias_id,
                                pav_id_producto:req.body.prod_producto_id
                            },
                            attributes: {exclude: ['createdAt', 'updatedAt', "pav_usu_usuario_creador_id", "pav_usu_usuario_modificador_id"]}
                        });

                        //console.log(constAtributoProductosValores)

                        var Valor = '';
                        var ValorID = '';
                        var Creado = false;
                        if(constAtributoProductosValores)
                        {
                            ValorID = constAtributoProductosValores.pav_productos_atributos_valores_id;
                            Valor = constAtributoProductosValores.pav_valor;
                            Creado = true;
                        }
                        else
                        {
                            ValorID = '';
                            Valor = '';
                        }

                        //Buscar Atributos datos
                        const constAtributo = await models.Atributo.findOne(
                        {
                            where: {
                                at_atributo_id: constAtributoCategorias[i].dataValues.atc_id_atributo
                            },
                            attributes: {exclude: ['createdAt', 'updatedAt']}
                        });
                

                        //Variable para Lineas
                        var jsonArray = {
                            "atc_atributos_categorias_id": constAtributoCategorias[i].atc_atributos_categorias_id,
                            "atc_cmm_estatus_id": constAtributoCategorias[i].dataValues.atc_cmm_estatus_id,
                            "at_atributo_id": constAtributo.at_atributo_id,
                            "at_nombre": constAtributo.at_nombre,
                            "at_descripcion": constAtributo.at_descripcion,
                            "pav_productos_atributos_valores_id": ValorID,
                            "pav_valor": Valor,
                            "prod_valor_validacion_creado": Creado
                        }
                        arrayAtributosCategorias.push(jsonArray);

                    }//fin for relacion valor-producto

                    var responseFinal = {
                        "cat_categoria_id": constCategoria.cat_categoria_id,
                        "cat_nombre": constCategoria.cat_nombre,
                        "prod_sku": constProducto.prod_sku,
                        "prod_producto_id": constProducto.prod_producto_id,
                        "atributos_categorias_lista": arrayAtributosCategorias
                    }
                }
                else//En caso de que no encuentre el producto padre mandara la variable
                {
                    responseFinal = "No se encontro producto padre"
                }

                res.status(200).send({
                    message: responseFinal
                })
            }catch(e){
                res.status(500).send({
                    message: 'Error en la petición',
                    e
                });
                next(e);
            }
        },

        //Recupera todos los atributos de producto (padre)
        getProductoAtributos: async(req, res, next) =>{
            try{
                //Obtener todas las relaciones de categorias con atributos
                const constProducto = await models.Producto.findOne(
                {
                    where: {
                        prod_producto_id: req.body.prod_producto_id,
                        prod_prod_producto_padre_sku: null 
                    },
                    attributes: {exclude: ['createdAt', 'updatedAt']}
                });

                var responseFinal = 'Lista Completa';

                //Si la categoria existe se buscara sus relaciones con atributos
                if(constProducto)
                {

                    //Busca el total de relaciones que tiene un id SKU en la tabla atributos productos
                    const constAtributoProductos = await models.AtributoProductos.findAll(
                    {
                        where: {
                            atp_id_producto: req.body.prod_producto_id,
                            atp_cmm_estatus_id: { [Op.ne] : statusControles.ATRIBUTO_PRODUCTO.ELIMINADA }
                        },
                        attributes: {exclude: ['createdAt', 'updatedAt']}
                    });

                    //console.log(constAtributoProductos)


                    //Arreglo que contendra todos los atributos de categoria
                    var arrayAtributosProductos = [];

                    //Del total de relaciones hara un 
                    for (var i = 0; i < constAtributoProductos.length; i++) 
                    {
                        //Buscar Atributos datos
                        const constAtributo = await models.Atributo.findOne(
                        {
                            where: {
                                at_atributo_id: constAtributoProductos[i].dataValues.atp_id_atributo
                            },
                            attributes: {exclude: ['createdAt', 'updatedAt']}
                        });

                        //Variable para Lineas
                        var jsonArray = {
                            "atp_atributo_producto_id": constAtributoProductos[i].dataValues.atp_atributo_producto_id,
                            "atp_id_atributo": constAtributoProductos[i].dataValues.atp_id_atributo,
                            "atp_cmm_estatus_id": constAtributoProductos[i].dataValues.atp_cmm_estatus_id,
                            "at_nombre": constAtributo.at_nombre,
                            "at_atributo_id": constAtributo.at_atributo_id,
                            "at_descripcion": constAtributo.at_descripcion
                        }
                        arrayAtributosProductos.push(jsonArray);


                    } //Fin for

                    var responseFinal = {
                        "prod_producto_id": constProducto.prod_producto_id,
                        "prod_nombre": constProducto.prod_nombre,
                        "atributos_categorias_lista": arrayAtributosProductos
                    }

                }
                else //No Existe la categoria
                {
                    responseFinal = 'El producto no existe';
                }

                //Final response
                res.status(200).send({
                    message: responseFinal,
                    //constAtributoCategorias
                })
            }catch(e){
                res.status(500).send({
                    message: 'Error en la petición',
                    e
                });
                next(e);
            }
        },

        //Recupera la informacion de atributos de un SKU HIJO
        getSKUAtributosProductosValores: async(req, res, next) =>{
            try{

                //console.log(req.body.prod_producto_id);

                //Validar que sea producto hijo
                const constProducto = await models.Producto.findOne(
                {
                    where: {
                        prod_producto_id: req.body.prod_producto_id,
                        prod_prod_producto_padre_sku: { [Op.ne] : null }
                    },
                    attributes: {exclude: ['createdAt', 'updatedAt']}
                });

                var responseFinal = 'Lista Completa';

                //Si el producto es hijo y existe buscara sus atributos de categoria con valores.
                if(constProducto)
                {
                    
                    //Si el producto hijo existe, obtener producto padre id
                    const constProductoIDPadre = await models.Producto.findOne(
                    {
                        where: {
                            prod_sku: constProducto.dataValues.prod_prod_producto_padre_sku
                        },
                        attributes: {exclude: ['createdAt', 'updatedAt']}
                    });


                    //Busca el total de relaciones que tiene un  en categorias-atributos tabla
                    const constAtributoProductos = await models.AtributoProductos.findAll(
                    {
                        where: {
                            atp_id_producto: constProductoIDPadre.prod_producto_id,
                            atp_cmm_estatus_id: { [Op.ne] : statusControles.ATRIBUTO_PRODUCTO.ELIMINADA }
                        },
                        attributes: {exclude: ['createdAt', 'updatedAt']}
                    });

                    //Crear arreglo del total de atributos con valor
                    var arrayAtributosCategorias = [];

                    //Tomara el total de veces que aparesca el id del atributo categoria en la tabla atributos-categorias
                    for (var i = 0; i < constAtributoProductos.length; i++) 
                    {
                        //console.log(constAtributoProductos[i].dataValues)


                        //obtiene los valores 
                        const constAtributoSkuValores = await models.AtributoSkuValores.findOne(
                        {
                            where: {
                                skuav_id_atributo_producto: constAtributoProductos[i].dataValues.atp_atributo_producto_id,
                                skuav_id_sku: req.body.prod_producto_id
                            },
                            attributes: {exclude: ['createdAt', 'updatedAt', "pav_usu_usuario_creador_id", "pav_usu_usuario_modificador_id"]}
                        });

                        //console.log(constAtributoProductosValores)

                        var Valor = '';
                        var ValorID = '';
                        var Creado = false;
                        if(constAtributoSkuValores)
                        {
                            ValorID = constAtributoSkuValores.skuav_sku_atributos_valores_id;
                            Valor = constAtributoSkuValores.skuav_valor;
                            Creado = true;
                        }
                        else
                        {
                            ValorID = '';
                            Valor = '';
                        }

                        //Buscar Atributos datos
                        const constAtributo = await models.Atributo.findOne(
                        {
                            where: {
                                at_atributo_id: constAtributoProductos[i].dataValues.atp_id_atributo
                            },
                            attributes: {exclude: ['createdAt', 'updatedAt']}
                        });
                

                        //Variable para Lineas
                        var jsonArray = {
                            "atp_atributo_producto_id": constAtributoProductos[i].atp_atributo_producto_id,
                            "atp_cmm_estatus_id": constAtributoProductos[i].dataValues.atp_cmm_estatus_id,
                            "at_atributo_id": constAtributo.at_atributo_id,
                            "at_nombre": constAtributo.at_nombre,
                            "at_descripcion": constAtributo.at_descripcion,
                            "skuav_id_atributo_producto": ValorID,
                            "skuav_valor": Valor,
                            "sku_valor_validacion_creado": Creado
                        }
                        arrayAtributosCategorias.push(jsonArray);

                    }//fin for relacion valor-producto

                    var responseFinal = {
                        "prod_producto_id_padre": constProductoIDPadre.prod_producto_id,
                        "prod_sku_padre": constProductoIDPadre.prod_sku,
                        "prod_producto_id_hijo": constProducto.prod_producto_id,
                        "prod_sku_hijo": constProducto.prod_sku,
                        "atributos_categorias_lista": arrayAtributosCategorias
                    }
                }
                else//En caso de que no encuentre el producto padre mandara la variable
                {
                    responseFinal = "Producto invalido"
                }

                res.status(200).send({
                    message: responseFinal
                })
            }catch(e){
                res.status(500).send({
                    message: 'Error en la petición',
                    e
                });
                next(e);
            }
        },

        //Recupera la informacion de atributos de un SKU HIJO
        testing: async(req, res, next) =>{
            try{


                var workbook = XLSX.readFile('catCFDI.xls');
                var sheet_name_list = workbook.SheetNames;
                var xlData = XLSX.utils.sheet_to_json(workbook.Sheets[sheet_name_list[1]]);
                // console.log(sheet_name_list);


                console.log(sheet_name_list[0])


                //console.log(xlData.length)

                
                for (var i = 0; i < xlData.length; i++) 
                {   
                    console.log(xlData[i])
                    console.log(i)
                    var codigoPostal = xlData[i].c_CodigoPostal
                    var id_estado = xlData[i].c_Estado
                    var c_frontera = xlData[i].c_frontera

                    var estadoName;
                    switch(id_estado)
                    {
                        case 'AGU':
                            estadoName = "AGS"
                        break;

                        case 'BCN':
                            estadoName = "BC"
                        break;

                        case 'BCS':
                            estadoName = "BCS"
                        break;

                        case 'CAM':
                            estadoName = "CAM"
                        break;

                        case 'CHH':
                            estadoName = "CHI"
                        break;

                        case 'CHP':
                            estadoName = "CHS"
                        break;

                        case 'COA':
                            estadoName = "COA"
                        break;

                        case 'COL':
                            estadoName = "COL"
                        break;

                        case 'DIF':
                            estadoName = "DF"
                        break;

                        case 'DUR':
                            estadoName = "DUR"
                        break;

                        case 'GRO':
                            estadoName = "GRO"
                        break;

                        case 'GUA':
                            estadoName = "GTO"
                        break;

                        case 'HID':
                            estadoName = "HID"
                        break;

                        case 'JAL':
                            estadoName = "JAL"
                        break;

                        case 'MEX':
                            estadoName = "MEX"
                        break;

                        case 'MIC':
                            estadoName = "MCH"
                        break;


                        case 'MOR':
                            estadoName = "MOR"
                        break;

                        case 'NAY':
                            estadoName = "NAY"
                        break;

                        case 'NLE':
                            estadoName = "NL"
                        break;

                        case 'OAX':
                            estadoName = "OAX"
                        break;

                        case 'PUE':
                            estadoName = "PUE"
                        break;

                        case 'PUE':
                            estadoName = "PUE"
                        break;

                        case 'QUE':
                            estadoName = "QUE"
                        break;

                        case 'ROO':
                            estadoName = "QR"
                        break;

                        case 'SIN':
                            estadoName = "SIN"
                        break;

                        case 'SLP':
                            estadoName = "SLP"
                        break;

                        case 'SON':
                            estadoName = "SON"
                        break;

                        case 'TAB':
                            estadoName = "TAB"
                        break;

                        case 'TAM':
                            estadoName = "TAM"
                        break;

                        case 'TLA':
                            estadoName = "TLA"
                        break;

                        case 'VER':
                            estadoName = "VER"
                        break;

                        case 'YUC':
                            estadoName = "YUC"
                        break;

                        case 'ZAC':
                            estadoName = "ZAC"
                        break;
                    }


                    console.log(estadoName)

                    const constEstado = await models.Estado.findOne(
                    {
                        where: {
                            estpa_codigo_estado: estadoName
                        }
                    })
                    //console.log(constEstado.estpa_estado_pais_id)

                    const constCodigosPostales = await models.CodigosPostales.findOne(
                    {
                        where: {
                            cp_codigo_postal: codigoPostal
                        }
                    })

                    console.log(codigoPostal)

                    if(constCodigosPostales) 
                    {
                        console.log("ACTUALIZAR")
                        const bodyUpdate = {
                            "cp_codigo_postal": codigoPostal,
                            "cp_estado_pais_id": constEstado.estpa_estado_pais_id,
                            "cp_frontera": c_frontera,
                            updatedAt: Date()
                        }
                        
                        await constCodigosPostales.update(bodyUpdate);

                    }
                    else //Crear
                    {
                        console.log("CREAR")
                        const bodyCreate = {
                            "cp_codigo_postal": codigoPostal,
                            "cp_estado_pais_id": constEstado.estpa_estado_pais_id,
                            "cp_frontera": c_frontera
                        };
                             
                        await models.CodigosPostales.create(bodyCreate);

                        console.log(bodyCreate)
                    }


                }

                res.status(200).send({
                    message: "Finalizo con exito"
                })
            }catch(e){
                res.status(500).send({
                    message: 'Error en la petición',
                    e
                });
                next(e);
            }
        },

        //Recupera la informacion solamente de los atributos por id de categoria
        getAllAtributosPadres: async(req, res, next) =>{
            try{
                

                

                var querySQL = `
                    select 
                    ac.atc_id_atributo, atr.at_nombre 
                from 
                    atributos_categorias ac 
                    left join atributos atr on ac.atc_id_atributo = atr.at_atributo_id 
                    group by ac.atc_id_atributo, atr.at_nombre 
                `;


                const constAtributosCategorias = await sequelize.query(querySQL,
                { 
                    type: sequelize.QueryTypes.SELECT 
                });


                res.status(200).send({
                    message: "Atributos de categoria padre Listado",
                    constAtributosCategorias
                })
            }catch(e){
                res.status(500).send({
                    message: 'Error en la petición',
                    e
                });
                next(e);
            }
        },

        //Recupera la informacion solamente de los atributos por id de categoria
        getValuesFromAtributte: async(req, res, next) =>{
            try{
                var querySQL = `
                    select 
                        pav_valor 
                    from 
                        atributos_categorias ac 
                        left join productos_atributos_valores pav on ac.atc_atributos_categorias_id = pav.pav_atributo_categoria 
                    where 
                        ac.atc_id_atributo = `+req.params.IDAtribute+`
                    group by pav_valor
                `;


                const constAtributosCategorias = await sequelize.query(querySQL,
                { 
                    type: sequelize.QueryTypes.SELECT 
                });


                res.status(200).send({
                    message: "Atributos de categoria padre Listado",
                    constAtributosCategorias
                })
            }catch(e){
                res.status(500).send({
                    message: 'Error en la petición',
                    e
                });
                next(e);
            }
        },






        //APIS SIN TOKENS PARA FRONT
            //Recupera la informacion solamente de los atributos por id de categoria
            getCategoriasAtributosST: async(req, res, next) =>{
                try{

                    //console.log(req.body.prod_producto_id);

                    //Obtener todas las relaciones de categorias con atributos
                    const constCategoria = await models.Categoria.findOne(
                    {
                        where: {
                            cat_categoria_id: req.body.cat_categoria_id
                        },
                        attributes: {exclude: ['createdAt', 'updatedAt']}
                    });

                    var responseFinal = 'Lista Completa';

                    //Si la categoria existe se buscara sus relaciones con atributos
                    if(constCategoria)
                    {
                        //Busca el total de relaciones que tiene una categoria en categorias-atributos tabla
                        const constAtributoCategorias = await models.AtributoCategorias.findAll(
                        {
                            where: {
                                atc_id_categoria: constCategoria.dataValues.cat_categoria_id,
                                atc_cmm_estatus_id: { [Op.ne] : statusControles.ATRIBUTO_CATEGORIAS.ELIMINADA }
                            },
                            attributes: {exclude: ['createdAt', 'updatedAt']}
                        });

                        //Arreglo que contendra todos los atributos de categoria
                        var arrayAtributosCategorias = [];

                        //Del total de relaciones hara un 
                        for (var i = 0; i < constAtributoCategorias.length; i++) 
                        {
                            //console.log(constAtributoCategorias[i].dataValues)
                            
                            //Buscar Atributos datos
                            const constAtributo = await models.Atributo.findOne(
                            {
                                where: {
                                    at_atributo_id: constAtributoCategorias[i].dataValues.atc_id_atributo
                                },
                                attributes: {exclude: ['createdAt', 'updatedAt']}
                            });

                            //console.log(constAtributo)
                            //Variable para Lineas
                            var jsonArray = {
                                "atc_atributos_categorias_id": constAtributoCategorias[i].dataValues.atc_atributos_categorias_id,
                                "atc_id_atributo": constAtributoCategorias[i].dataValues.atc_id_atributo,
                                "at_nombre": constAtributo.at_nombre,
                                "at_atributo_id": constAtributo.at_atributo_id,
                                "at_descripcion": constAtributo.at_descripcion,
                                "atc_cmm_estatus_id": constAtributoCategorias[i].dataValues.atc_cmm_estatus_id
                            }
                            arrayAtributosCategorias.push(jsonArray);


                        } //Fin for

                        var responseFinal = {
                            "cat_categoria_id": constCategoria.cat_categoria_id,
                            "cat_nombre": constCategoria.cat_nombre,
                            "atributos_categorias_lista": arrayAtributosCategorias
                        }


                    }
                    else //No Existe la categoria
                    {
                        responseFinal = 'La categoria no existe';
                    }


                    res.status(200).send({
                        message: responseFinal,
                        //constAtributoCategorias
                    })
                }catch(e){
                    res.status(500).send({
                        message: 'Error en la petición',
                        e
                    });
                    next(e);
                }
            },
            
            //Recupera la informacion solamente de los atributos por id de categoria
            getValuesFromAtributteST: async(req, res, next) =>{
                try{
                    var querySQL = `
                        select 
                            pav_valor 
                        from 
                            atributos_categorias ac 
                            left join productos_atributos_valores pav on ac.atc_atributos_categorias_id = pav.pav_atributo_categoria 
                        where 
                            ac.atc_id_atributo = `+req.params.IDAtribute+`
                        group by pav_valor
                    `;


                    const constAtributosCategorias = await sequelize.query(querySQL,
                    { 
                        type: sequelize.QueryTypes.SELECT 
                    });


                    res.status(200).send({
                        message: "Atributos de categoria padre Listado",
                        constAtributosCategorias
                    })
                }catch(e){
                    res.status(500).send({
                        message: 'Error en la petición',
                        e
                    });
                    next(e);
                }
            },

            getProductosByFiltroAtributoPadresST: async (req, res, next) =>{
                try{
                    var varlimit = req.body.limite
                    var varoffset = 0 + (req.body.pagina) * varlimit
                    var categoriaID = req.body.cat_categoria_id

                    var ordenamientoBy = req.body.orderBy
                    var ASCDESC = req.body.ASCDESC

                    switch(ordenamientoBy)
                    {
                        case null: 
                            ordenamientoBy = "prod_nombre"
                            ASCDESC = ''
                            break;

                        case '': 
                            ordenamientoBy = "prod_nombre"
                            ASCDESC = ''
                            break;

                        case "precio":
                            ordenamientoBy = "prod_precio"
                            break; 

                        case "mas vendido":
                            ordenamientoBy = "total_vendidos"
                            break;

                        case "mejores valorados":
                            ordenamientoBy = "prod_calificacion_promedio"
                            break;

                        case "az-za":
                            ordenamientoBy = "prod_nombre"
                            break;

                        case "fecha lanzamienta":
                            ordenamientoBy = "lanzamiento"
                            break;
                    }

                    if(ordenamientoBy == null)
                    {
                        ordenamientoBy = "prod_nombre"
                        ASCDESC = ''
                    }

                    // var AtributosArray2 = 

                    const AtributosArray = req.body.AtributosArray

                    
                    if(AtributosArray.length == 1)  //SI SOLO TRAE UN ATRIBUTO A BUSCAR Y UN VALOR
                    {
                        
                        var querySQL = `
                            select 
                                p2.prod_sku
                            from 
                                atributos_categorias ac 
                                left join productos_atributos_valores pav on ac.atc_atributos_categorias_id = pav.pav_atributo_categoria 
                                left join productos p2 on p2.prod_producto_id = pav.pav_id_producto 
                            where
                                atc_cmm_estatus_id = 1000093
                                and ac.atc_id_atributo = `+AtributosArray[0].atc_id_atributo+`
                                and pav.pav_valor = '`+AtributosArray[0].pav_valor+`'
                        `;


                        //OBTIENE LOS ELEMENTOS BUSCADOS
                        const constSKUs = await sequelize.query(querySQL,
                        { 
                            type: sequelize.QueryTypes.SELECT 
                        });

                        console.log(constSKUs)

                        var listaSKU = '';
                        for (var i = 0; i < constSKUs.length; i++) 
                        {
                           
                            listaSKU = listaSKU + "'"+  constSKUs[i].prod_sku  + "'"

                            if(i+1 < constSKUs.length)
                            {
                                listaSKU = listaSKU + ","
                            }
                            else
                            {
                                
                            }

                        }

                        if(listaSKU == '')
                        {
                            listaSKU = "'noitems'";
                        }

                        const constProductosFiltrados = await models.Producto.findAndCountAll({
                            where: {
                                prod_cmm_estatus_id: statusControles.ESTATUS_PRODUCTO.ACTIVO,
                                prod_cat_categoria_id: categoriaID,
                                [Op.or]: [
                                    Sequelize.literal("prod_sku in (" + listaSKU + ")"),
                                ]
                            }
                        })

                        var countTotal = constProductosFiltrados.count


                        const rows = await sequelize.query(`
                        select 
                            p5.prod_producto_id,
                            p5.prod_nombre,
                            p5.prod_descripcion,
                            p5.prod_sku,
                            p5.prod_precio,
                            m2.mar_marca_id,
                            m2.mar_nombre,
                            p5.prod_cmm_estatus_id,
                            cmm.cmm_valor,  
                            c2.cat_cmm_estatus_id,
                            cmm2.cmm_valor as cat_cmm_valor,
                            c2.cat_nombre,
                            pv.prv_nombre,
                            p5.prod_nombre_extranjero,
                            p5.prod_calificacion_promedio,
                            p5."createdAt" as "lanzamiento",
                            COALESCE(SUM(pdcf.pcf_cantidad_producto),0) as "total_vendidos"
                        from 
                            productos p5
                            left join categorias c2 on p5.prod_cat_categoria_id = c2.cat_categoria_id
                            left join proveedores pv on p5.prod_proveedor_id = pv.prv_proveedores_id
                            left join marcas m2 on p5.prod_mar_marca_id = m2.mar_marca_id
                            left join controles_maestros_multiples cmm on p5.prod_cmm_estatus_id = cmm.cmm_control_id
                            left join controles_maestros_multiples cmm2 on c2.cat_cmm_estatus_id = cmm2.cmm_control_id
                            left join productos_de_compra_finalizada pdcf on p5.prod_producto_id = pdcf.pcf_prod_producto_id 
                        where 
                            p5.prod_sku in (` + listaSKU + `)
                            AND p5."prod_prod_producto_padre_sku" IS NULL 
                            AND p5."prod_cmm_estatus_id" = 1000016 
                            AND p5."prod_cat_categoria_id" = `+categoriaID+`
                        group by p5.prod_producto_id, m2.mar_marca_id, cmm.cmm_valor, c2.cat_cmm_estatus_id, cmm2.cmm_valor, c2.cat_nombre, pv.prv_nombre, "lanzamiento" 
                        order by `+ordenamientoBy+` `+ASCDESC+` LIMIT `+varlimit+` OFFSET `+varoffset+` 
                        `,

                         // 
                        { 
                            type: sequelize.QueryTypes.SELECT 
                        });


                        //obtener hijos de cada row encontrado PRECIOS Y STOCK
                            for (var i = 0; i < rows.length; i++) 
                            {
                                const constHijosListaPerProductoPadre = await models.Producto.findAll({
                                    where: {
                                        prod_prod_producto_padre_sku : rows[i].prod_sku,
                                        prod_cmm_estatus_id: statusControles.ESTATUS_PRODUCTO.ACTIVO
                                    },
                                    attributes: ['prod_producto_id', 'prod_sku', 'prod_viñetas', 'prod_precio'],
                                    include: [
                                        {
                                            model: models.ImagenProducto
                                        }
                                    ]
                                })

                                //Si existen hijos de un producto padre se le concatenan
                                var ListaPreciosTemp = []
                                var ListaStockTemp = []
                                if(constHijosListaPerProductoPadre)
                                {
                                    //concatenacion
                                    rows[i].ListaHijos = constHijosListaPerProductoPadre


                                    //LISTA PRECIOS
                                    for (var f = 0; f < rows[i].ListaHijos.length; f++) 
                                    {

                                        const constProductoListaPrecio = await models.ProductoListaPrecio.findAll({
                                            where: {
                                                pl_prod_producto_id : rows[i].ListaHijos[f].prod_producto_id
                                            }
                                        })
                                        ListaPreciosTemp.push(constProductoListaPrecio)
                                    }

                                    rows[i].ListaPrecios = ListaPreciosTemp


                                    //LISTA STOCK
                                    for (var f = 0; f < rows[i].ListaHijos.length; f++) 
                                    {

                                        const constStockProducto = await models.StockProducto.findAll({
                                            where: {
                                                sp_prod_producto_id : rows[i].ListaHijos[f].prod_producto_id
                                            }
                                        })
                                        ListaStockTemp.push(constStockProducto)
                                    }

                                    rows[i].ListaStock = ListaStockTemp

                                }
                                else
                                {
                                    rows[i].ListaHijos = {}
                                }
                            }
                        //Fin obtener informacion adicional




                        const mainConsultaProductos = {
                            count: parseInt(countTotal),
                            rows
                        }



                        res.status(200).send({
                            message: 'Lista de productos',
                            mainConsultaProductos
                        })

                    }
                    else if(AtributosArray.length == 0) //SI LA API NO TRAI NADA EN EL JSON DE ATRIBUTOS
                    {
                        res.status(200).send({
                            message: 'No se encontro atributos a buscar'
                        })
                    }
                    else
                    {
                        //Obtener categorias que coincidan con el atributo seleccionado
                            var querySQL = `
                                select atc_id_categoria, count(*) as "conteo"
                                from atributos_categorias ac 
                                where atc_cmm_estatus_id = `+statusControles.ATRIBUTO_CATEGORIAS.ACTIVO+` and (
                            `;

                            for (var i = 0; i < AtributosArray.length; i++) 
                            {
                                //console.log(AtributosArray[i].atc_id_atributo);
                                var atributo_id = AtributosArray[i].atc_id_atributo


                                querySQL = querySQL + `
                                    atc_id_atributo = `+ atributo_id +` 
                                `;

                                if(i+1 < AtributosArray.length)
                                {
                                    querySQL = querySQL + " or "
                                }
                            }

                            querySQL = querySQL + ` )
                                group by atc_id_categoria
                                HAVING count(*) = `+AtributosArray.length+`
                            `;

                            //console.log("cantidad:"+AtributosArray.length)
                            //OBTIENE LOS ELEMENTOS BUSCADOS
                            const constSKUs = await sequelize.query(querySQL,
                            { 
                                type: sequelize.QueryTypes.SELECT 
                            });
                        //FIN Obtener categorias que coincidan con el atributo seleccionado
                        console.log("total de categorias")
                        console.log(constSKUs)




















                        //Obtener ID que relacion categorias atributos con valores
                            //OBTENER ID DE CATEGORIA-ATRIBUTOS
                                var listaSKU2 = []

                                for (var j = 0; j < constSKUs.length; j++) 
                                {   

                                    var querySQL2 = `
                                        select 
                                            ac.atc_atributos_categorias_id, atc_id_atributo 
                                        from 
                                            atributos_categorias ac
                                            left join productos_atributos_valores pav on ac.atc_atributos_categorias_id = pav.pav_atributo_categoria 
                                        where atc_cmm_estatus_id = `+statusControles.ATRIBUTO_CATEGORIAS.ACTIVO+` and atc_id_categoria = `+constSKUs[j].atc_id_categoria+` and (

                                    `;

                                    //OBTENER OR'S DE ATRIBUTOS VAR
                                    for (var H = 0; H < AtributosArray.length; H++) 
                                    {
                                        var atributo_id = AtributosArray[H].atc_id_atributo
                                        querySQL2 = querySQL2 + `
                                            atc_id_atributo = `+ atributo_id +` 
                                        `;

                                        if(H+1 < AtributosArray.length)
                                        {
                                            querySQL2 = querySQL2 + " or "
                                        }
                                    }
                                    querySQL2 = querySQL2 + ` )`


                                    const constIDCatAtr = await sequelize.query(querySQL2,
                                    { 
                                        type: sequelize.QueryTypes.SELECT 
                                    });



                                    var querySQL3 = `
                                        select 
                                            pav_id_producto, count(*) as "conteo", p2.prod_sku 
                                        from 
                                            productos_atributos_valores pav 
                                            left join productos p2 on pav.pav_id_producto = p2.prod_producto_id 
                                        where
                                            pav_cmm_estatus_id = `+statusControles.ATRIBUTO_PRODUCTOS_VALOR.ACTIVO+` and
                                    `;
                                    console.log("constIDCatAtr")
                                    console.log(constIDCatAtr)
                                    //FOR que buscara en base a los atributos id para hacer match con los valores de la api
                                    for (var f = 0; f < constIDCatAtr.length; f++) 
                                    {  
                                        var encontrarValorAtributoFromAPI;


                                        for (var t = 0; t < AtributosArray.length; t++) 
                                        { 
                                            if(AtributosArray[t].atc_id_atributo == constIDCatAtr[f].atc_id_atributo)
                                            {
                                                encontrarValorAtributoFromAPI = AtributosArray[t].pav_valor
                                            }
                                        }

                                        querySQL3 = querySQL3 + `
                                            (pav_atributo_categoria = `+constIDCatAtr[f].atc_atributos_categorias_id+` and pav_valor = '`+encontrarValorAtributoFromAPI+`')
                                        `;
                                        //AGREGA OR's
                                        if(f+1 < constIDCatAtr.length)
                                        {
                                            querySQL3 = querySQL3 + " or "
                                        }
                                    }

                                    querySQL3 = querySQL3 + `
                                        group by pav_id_producto, prod_sku
                                        HAVING count(*) = `+AtributosArray.length+`
                                    `

                                    const constFinalSKU = await sequelize.query(querySQL3,
                                    { 
                                        type: sequelize.QueryTypes.SELECT 
                                    });

                                    console.log("constFInalSKU")
                                    console.log(constFinalSKU)

                                    for (var z = 0; z < constFinalSKU.length; z++) 
                                    {
                                        
                                        //INCLUYE SOLO SKUS que no esten repetidos
                                        if(listaSKU2.includes(constFinalSKU[z].prod_sku))
                                        {

                                        }
                                        else
                                        {
                                            listaSKU2.push(constFinalSKU[z].prod_sku)
                                        }

                                    }
                                }
                            //console.log(listaSKU2)



























                        //Fin obtener ID de relacion categorias atributos con valores
                                console.log("Lista de listaSKU2")
                                console.log(listaSKU2)

                        //Generar IN para sql
                            var ListaFinal = '';
                            console.log(listaSKU2)
                            for (var u = 0; u < listaSKU2.length; u++) 
                            {
                                ListaFinal = ListaFinal + "'"+  listaSKU2[u]  + "'"

                                if(u+1 < listaSKU2.length)
                                {
                                    ListaFinal = ListaFinal + ","
                                }
                            }
                        //Fin genera in para sql    

                        if(ListaFinal == 'fewfewf')
                        {
                            res.status(200).send({
                                message: 'No se han encontrado coincidencias'
                            })
                        }
                        else
                        {

                            if(ListaFinal == '')
                            {
                                ListaFinal = "'noitems'";
                            }

                            //GENERAR SKUS y paginarlos
                            const constProductosFiltrados = await models.Producto.findAndCountAll({
                                where: {
                                    prod_cmm_estatus_id: statusControles.ESTATUS_PRODUCTO.ACTIVO,
                                    prod_cat_categoria_id: categoriaID,
                                    [Op.or]: [
                                        Sequelize.literal("prod_sku in (" + ListaFinal + ")"),
                                    ]
                                }
                            })


                            var countTotal = constProductosFiltrados.count


                            const rows = await sequelize.query(`
                            select 
                                p5.prod_producto_id,
                                p5.prod_nombre,
                                p5.prod_descripcion,
                                p5.prod_sku,
                                p5.prod_precio,
                                m2.mar_marca_id,
                                m2.mar_nombre,
                                p5.prod_cmm_estatus_id,
                                cmm.cmm_valor,  
                                c2.cat_cmm_estatus_id,
                                cmm2.cmm_valor as cat_cmm_valor,
                                c2.cat_nombre,
                                pv.prv_nombre,
                                p5.prod_nombre_extranjero,
                                p5.prod_calificacion_promedio,
                                p5."createdAt" as "lanzamiento",
                                COALESCE(SUM(pdcf.pcf_cantidad_producto),0) as "total_vendidos"
                            from 
                                productos p5
                                left join categorias c2 on p5.prod_cat_categoria_id = c2.cat_categoria_id
                                left join proveedores pv on p5.prod_proveedor_id = pv.prv_proveedores_id
                                left join marcas m2 on p5.prod_mar_marca_id = m2.mar_marca_id
                                left join controles_maestros_multiples cmm on p5.prod_cmm_estatus_id = cmm.cmm_control_id
                                left join controles_maestros_multiples cmm2 on c2.cat_cmm_estatus_id = cmm2.cmm_control_id
                                left join productos_de_compra_finalizada pdcf on p5.prod_producto_id = pdcf.pcf_prod_producto_id 
                            where 
                                p5.prod_sku in (` + ListaFinal + `)
                                AND p5."prod_prod_producto_padre_sku" IS NULL 
                                AND p5."prod_cmm_estatus_id" = 1000016 
                                AND p5."prod_cat_categoria_id" = `+categoriaID+`
                            group by p5.prod_producto_id, m2.mar_marca_id, cmm.cmm_valor, c2.cat_cmm_estatus_id, cmm2.cmm_valor, c2.cat_nombre, pv.prv_nombre, "lanzamiento" 
                            order by `+ordenamientoBy+` `+ASCDESC+` LIMIT `+varlimit+` OFFSET `+varoffset+` 
                            `,

                             // 
                            { 
                                type: sequelize.QueryTypes.SELECT 
                            });


                            //obtener hijos de cada row encontrado PRECIOS Y STOCK
                                for (var i = 0; i < rows.length; i++) 
                                {
                                    const constHijosListaPerProductoPadre = await models.Producto.findAll({
                                        where: {
                                            prod_prod_producto_padre_sku : rows[i].prod_sku,
                                            prod_cmm_estatus_id: statusControles.ESTATUS_PRODUCTO.ACTIVO
                                        },
                                        attributes: ['prod_producto_id', 'prod_sku', 'prod_viñetas', 'prod_precio'],
                                        include: [
                                            {
                                                model: models.ImagenProducto
                                            }
                                        ]
                                    })

                                    //Si existen hijos de un producto padre se le concatenan
                                    var ListaPreciosTemp = []
                                    var ListaStockTemp = []
                                    if(constHijosListaPerProductoPadre)
                                    {
                                        //concatenacion
                                        rows[i].ListaHijos = constHijosListaPerProductoPadre


                                        //LISTA PRECIOS
                                        for (var f = 0; f < rows[i].ListaHijos.length; f++) 
                                        {

                                            const constProductoListaPrecio = await models.ProductoListaPrecio.findAll({
                                                where: {
                                                    pl_prod_producto_id : rows[i].ListaHijos[f].prod_producto_id
                                                }
                                            })
                                            ListaPreciosTemp.push(constProductoListaPrecio)
                                        }

                                        rows[i].ListaPrecios = ListaPreciosTemp


                                        //LISTA STOCK
                                        for (var f = 0; f < rows[i].ListaHijos.length; f++) 
                                        {

                                            const constStockProducto = await models.StockProducto.findAll({
                                                where: {
                                                    sp_prod_producto_id : rows[i].ListaHijos[f].prod_producto_id
                                                }
                                            })
                                            ListaStockTemp.push(constStockProducto)
                                        }

                                        rows[i].ListaStock = ListaStockTemp

                                    }
                                    else
                                    {
                                        rows[i].ListaHijos = {}
                                    }
                                }
                            //Fin obtener informacion adicional




                            const mainConsultaProductos = {
                                count: parseInt(countTotal),
                                rows
                            }



                            res.status(200).send({
                                message: 'Lista de productos',
                                mainConsultaProductos
                            })


                        }

                        
                    }

                }catch(e){
                    res.status(500).send({
                        message: 'Error al traer lista productos',
                        e
                    });
                    next(e);
                }
            },

            //Recupera la informacion de atributos de un SKU HIJO SIN TOKEN
            getSKUAtributosProductosValoresST: async(req, res, next) =>{
                try{
                    //Validar que sea producto hijo
                    const constProducto = await models.Producto.findOne(
                    {
                        where: {
                            prod_producto_id: req.body.prod_producto_id,
                            prod_prod_producto_padre_sku: { [Op.ne] : null }
                        },
                        attributes: {exclude: ['createdAt', 'updatedAt']}
                    });

                    var responseFinal = 'Lista Completa';

                    //Si el producto es hijo y existe buscara sus atributos de categoria con valores.
                    if(constProducto)
                    {
                        
                        //Si el producto hijo existe, obtener producto padre id
                        const constProductoIDPadre = await models.Producto.findOne(
                        {
                            where: {
                                prod_sku: constProducto.dataValues.prod_prod_producto_padre_sku
                            },
                            attributes: {exclude: ['createdAt', 'updatedAt']}
                        });


                        //Busca el total de relaciones que tiene un  en categorias-atributos tabla
                        const constAtributoProductos = await models.AtributoProductos.findAll(
                        {
                            where: {
                                atp_id_producto: constProductoIDPadre.prod_producto_id,
                                atp_cmm_estatus_id: { [Op.ne] : statusControles.ATRIBUTO_PRODUCTO.ELIMINADA }
                            },
                            attributes: {exclude: ['createdAt', 'updatedAt']}
                        });

                        //Crear arreglo del total de atributos con valor
                        var arrayAtributosCategorias = [];

                        //Tomara el total de veces que aparesca el id del atributo categoria en la tabla atributos-categorias
                        for (var i = 0; i < constAtributoProductos.length; i++) 
                        {
                            //obtiene los valores 
                            const constAtributoSkuValores = await models.AtributoSkuValores.findOne(
                            {
                                where: {
                                    skuav_id_atributo_producto: constAtributoProductos[i].dataValues.atp_atributo_producto_id,
                                    skuav_id_sku: req.body.prod_producto_id
                                },
                                attributes: {exclude: ['createdAt', 'updatedAt', "pav_usu_usuario_creador_id", "pav_usu_usuario_modificador_id"]}
                            });

                            var Valor = '';
                            var ValorID = '';
                            var Creado = false;
                            if(constAtributoSkuValores)
                            {
                                ValorID = constAtributoSkuValores.skuav_sku_atributos_valores_id;
                                Valor = constAtributoSkuValores.skuav_valor;
                                Creado = true;
                            }
                            else
                            {
                                ValorID = '';
                                Valor = '';
                            }

                            //Buscar Atributos datos
                            const constAtributo = await models.Atributo.findOne(
                            {
                                where: {
                                    at_atributo_id: constAtributoProductos[i].dataValues.atp_id_atributo
                                },
                                attributes: {exclude: ['createdAt', 'updatedAt']}
                            });

                            //Variable para Lineas
                            var jsonArray = {
                                "atp_atributo_producto_id": constAtributoProductos[i].atp_atributo_producto_id,
                                "atp_cmm_estatus_id": constAtributoProductos[i].dataValues.atp_cmm_estatus_id,
                                "at_atributo_id": constAtributo.at_atributo_id,
                                "at_nombre": constAtributo.at_nombre,
                                "at_descripcion": constAtributo.at_descripcion,
                                "skuav_id_atributo_producto": ValorID,
                                "skuav_valor": Valor,
                                "sku_valor_validacion_creado": Creado
                            }
                            arrayAtributosCategorias.push(jsonArray);

                        }//fin for relacion valor-producto

                        var responseFinal = {
                            "prod_producto_id_padre": constProductoIDPadre.prod_producto_id,
                            "prod_sku_padre": constProductoIDPadre.prod_sku,
                            "prod_producto_id_hijo": constProducto.prod_producto_id,
                            "prod_sku_hijo": constProducto.prod_sku,
                            "atributos_categorias_lista": arrayAtributosCategorias
                        }
                    }
                    else//En caso de que no encuentre el producto padre mandara la variable
                    {
                        responseFinal = "Producto invalido"
                    }

                    res.status(200).send({
                        message: responseFinal
                    })
                }catch(e){
                    res.status(500).send({
                        message: 'Error en la petición',
                        e
                    });
                    next(e);
                }
            },
        //





        //EXCEL ADD
            //Recuperar viñetas
            addAttributesFromExcel: async(req, res, next) =>{
                try{
                    var workbook = XLSX.readFile('attrtest.xlsx');
                    var sheet_name_list = workbook.SheetNames;
                    
                    // console.log(sheet_name_list);

                    //console.log(sheet_name_list.length)
                    var numPlantillaViñetas = 0;
                    for (var i = 0; i < sheet_name_list.length; i++) 
                    {
                        if(sheet_name_list[i] == "Plantilla de Datos")
                        {
                            numPlantillaViñetas = i
                            break
                        }
                    }

                    //console.log(sheet_name_list[numPlantillaViñetas])
                    var xlData = XLSX.utils.sheet_to_json(workbook.Sheets[sheet_name_list[numPlantillaViñetas]]);




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
                            //OBTENER INFORMACION PADRE
                            var ProductoID = productoUpdate.prod_producto_id
                            var ProductoPadre = productoUpdate.prod_prod_producto_padre_sku

                            const constproductoPadre = await models.Producto.findOne({
                                where: {
                                    prod_sku: ProductoPadre
                                }
                            });
                            var ProductoPadreID = constproductoPadre.prod_producto_id



                            //Settear variable de atributos
                            var variation_theme = xlData[i].variation_theme

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
                                console.log("valorAtributoSKU")
                                console.log(valorAtributoSKU)


                                //AGREGAR O UPDATE A LA TABLA VALORES ATRIBUTOS
                                if(constAtributoSkuValores)
                                {
                                    const bodyUpdate = {
                                        "skuav_valor":  valorAtributoSKU,   
                                        "skuav_usu_usuario_modificador_id": 1,
                                        updatedAt: Date()
                                    }
                                    await constAtributoSkuValores.update(bodyUpdate);
                                }
                                else
                                {
                                    const bodyCreate = {
                                        "skuav_id_sku" : ProductoID,
                                        "skuav_id_atributo_producto" :  ProductoAtributoID,
                                        "skuav_valor":  valorAtributoSKU,   
                                        "skuav_cmm_estatus_id": statusControles.ATRIBUTO_SKU_VALOR.ACTIVO,
                                        "skuav_usu_usuario_creador_id": 1
                                    };
                                    await models.AtributoSkuValores.create(bodyCreate);
                                }

                            }
                        }
                    }








                    res.status(200).send({
                        message: "Finalizo con exito"
                    })
                }catch(e){
                    res.status(500).send({
                        message: 'Error en la petición',
                        e
                    });
                    next(e);
                }
            },

            //Recuperar viñetas
            addCamposProductosFromExcel: async(req, res, next) =>{
                try{

                    var workbook = XLSX.readFile('attrtest.xlsx');
                    var sheet_name_list = workbook.SheetNames;
                    
                    //console.log(sheet_name_list);


                    //console.log(sheet_name_list.length)
                    var numHoja = 0;

                    for (var i = 0; i < sheet_name_list.length; i++) 
                    {
                        if(sheet_name_list[i] == "Plantilla de Datos")
                        {
                            numHoja = i
                            break
                        }
                    }

                    //console.log(sheet_name_list[numHoja])
                    var xlData = XLSX.utils.sheet_to_json(workbook.Sheets[sheet_name_list[numHoja]]);
                    // console.log(xlData)



                    //AGREGAR JSONS POR SKU
                    for (var i = 0; i < xlData.length; i++) 
                    {   
                        //console.log(xlData[i].SKU)

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

                            console.log(arrayCaracteristicasTecnicas)



                            var descripcion = xlData[i].Descripción

                            const bodyUpdate = {
                                "prod_viñetas" : arrayVinetas, 
                                "prod_descripcion": descripcion,
                                "prod_caracteristicas_tecnicas": arrayCaracteristicasTecnicas
                            };
                            
                            console.log("llego al final")
                            await productoUpdate.update(bodyUpdate);
                        }
                    }








                    res.status(200).send({
                        message: "Finalizo con exito"
                    })
                }catch(e){
                    res.status(500).send({
                        message: 'Error en la petición',
                        e
                    });
                    next(e);
                }
            },

            //Recupera la informacion de atributos de un SKU HIJO
            getVinetaFromProduct: async(req, res, next) =>{
                try{

                    //console.log(req.body.prod_producto_id);

                    //Validar que sea producto hijo
                    const constProducto = await models.Producto.findOne(
                    {
                        where: {
                            prod_producto_id: req.body.prod_producto_id,
                        },
                        attributes: ['prod_sku', 'prod_producto_id', 'prod_viñetas']
                    });

                    res.status(200).send({
                        message: "listado de viñetas de un producto",
                        constProducto
                    })
                }catch(e){
                    res.status(500).send({
                        message: 'Error en la petición',
                        e
                    });
                    next(e);
                }
            },


            
        //

    // Atributos Only
        getListAtributos: async(req, res, next) =>{
            try{
                const listaAtributos = await models.Atributo.findAll(
                    {
                        where: {
                            at_cmm_estatus_id: { [Op.ne] : statusControles.ESTATUS_ATRIBUTO.ELIMINADO }
                        },
                        attributes: {
                            exclude : ['at_usu_usuario_creador_id','createdAt','at_usu_usuario_modificador_id','updatedAt']
                        }
                    }
                    );
                res.status(200).send({
                    message: 'Lista de Atributos',
                    listaAtributos
                })
            }catch(e){
                res.status(500).send({
                    message: 'Error en la petición',
                    e
                });
                next(e);
            }
        },
        getAtributoByName: async(req, res, next) =>{
            try{
                const listaAtributoByName = await models.Atributo.findAll(
                {
                    where: {
                        at_nombre: { [Op.substring] : req.params.nombre }  
                    },
                    attributes: {exclude: ['createdAt', 'updatedAt']}
                });
                res.status(200).send({
                    message: 'Lista de Atributos',
                    listaAtributoByName
                })
            }catch(e){
                res.status(500).send({
                    message: 'Error en la petición',
                    e
                });
                next(e);
            }
        },
        createAtributo: async(req, res, next) =>{
            try
            {
                await models.Atributo.create(req.body)
                res.status(200).send(
                {
                    message: 'Atributo creado con exito'
                })
            }
            catch(e)
            {
                res.status(500).send(
                {
                  message: 'Error al crear Atributo',
                  e
                });
                next(e);
            }
        },
        updateAtributo: async(req, res, next) =>{
            try{
                const atributoUpdate = await models.Atributo.findOne({
                    where: {
                        at_atributo_id: req.body.at_atributo_id
                    }
                });

                await atributoUpdate.update({
                    at_atributo_id : !!req.body.at_atributo_id ? req.body.at_atributo_id : atributoUpdate.dataValues.at_atributo_id,
                    at_nombre : !!req.body.at_nombre ? req.body.at_nombre : atributoUpdate.dataValues.at_nombre,
                    at_descripcion : !!req.body.at_descripcion ? req.body.at_descripcion : atributoUpdate.dataValues.at_descripcion,
                    at_cmm_estatus_id : !!req.body.at_cmm_estatus_id ? req.body.at_cmm_estatus_id : atributoUpdate.dataValues.at_cmm_estatus_id,
                    at_usu_usuario_modificador_id : req.body.at_usu_usuario_modificador_id,
                    updatedAt: Date()
                });
                res.status(200).send({
                    message: 'Actualización correcta de atributo',
                    atributoUpdate
                })
            }catch(e){
                res.status(500).send({
                    message: 'Error al actualizar el atributo',
                    error: e
                });
                next(e);
            }
        },
        deleteAtributo: async(req, res, next) =>
        {
            try{
                const deleteAtributos = await models.Atributo.findOne({
                    where: {
                        at_atributo_id: req.body.at_atributo_id
                    }
                });

                await deleteAtributos.update(
                {
                  at_cmm_estatus_id : statusControles.ESTATUS_ATRIBUTO.ELIMINADO,
                  at_usu_usuario_modificado_id: req.body.at_usu_usuario_modificado_id,
                  updatedAt: Date()
                })

                res.status(200).send({
                  message: 'Eliminado Atributo Correctamente'
                });
                }catch(e){
                res.status(500).send({
                  message: 'Error al eliminar el atributo',
                  e
                });
                next(e);
            }
        },
        testAtributosPaginacion: async(req, res, next) =>{
            try{




                // Post.findAndCountAll({
                //     where: {...},
                //     order: [...],
                //     limit: 5,
                //     offset: 0,
                // }).then(function (result) {
                //     res.render(...);
                // });

                var varlimit = req.body.limite
                var varoffset = 0 + (req.body.pagina - 1) * varlimit



                const listaAtributos = await models.Atributo.findAndCountAll(
                    {
                        where: {
                            at_cmm_estatus_id: { [Op.ne] : statusControles.ESTATUS_ATRIBUTO.ELIMINADO }
                        },
                        limit: varlimit,
                        offset: varoffset,
                        attributes: {
                            exclude : ['at_usu_usuario_creador_id','createdAt','at_usu_usuario_modificador_id','updatedAt']
                        }
                    }
                    );
                res.status(200).send({
                    message: 'Lista de Atributos',
                    listaAtributos
                })
            }catch(e){
                res.status(500).send({
                    message: 'Error en la petición',
                    e
                });
                next(e);
            }
        },
    //Fin Atributos Only
 

    // Atributos Productos
        getListAtributosProductos: async(req, res, next) =>{
            try{
                const listaAtributosProductos = await models.AtributoProductos.findAll(
                    {
                        where: {
                            atp_cmm_estatus_id: { [Op.ne] : statusControles.ATRIBUTO_PRODUCTO.ELIMINADA }
                        },
                        attributes: {
                            exclude : ['atp_usu_usuario_creador_id','createdAt','atp_usu_usuario_modificador_id','updatedAt']
                        }
                    }
                    );
                res.status(200).send({
                    message: 'Lista de Atributos Productos',
                    listaAtributosProductos
                })
            }catch(e){
                res.status(500).send({
                    message: 'Error en la petición',
                    e
                });
                next(e);
            }
        },
        createAtributoProductos: async(req, res, next) =>{
            try
            {


                const constAtributoProductos = await models.AtributoProductos.findOne(
                {
                    where: {
                        atp_id_atributo: req.body.atp_id_atributo,
                        atp_id_producto: req.body.atp_id_producto,
                        atp_cmm_estatus_id: { [Op.ne] : statusControles.ATRIBUTO_PRODUCTO.ELIMINADA }
                    },
                    attributes: {
                        exclude : ['createdAt', 'updatedAt']
                    }
                });



                if(constAtributoProductos)
                {
                    res.status(500).send(
                    {
                        message: 'Relacion Atributo-Producto ya existe',
                    });
                }
                else
                {
                    await models.AtributoProductos.create(req.body)

                    res.status(200).send(
                    {
                        message : 'Relacion Atributo-Producto creada con exito'
                    })
                }
            }
            catch(e)
            {
                res.status(500).send(
                {
                  message: 'Error al crear relacion Atributo Productos',
                  e
                });
                next(e);
            }
        },
        updateAtributoProducto: async(req, res, next) =>
        {
            try{
                const atributoProductosUpdate = await models.AtributoProductos.findOne({
                    where: {
                        atp_atributo_producto_id: req.body.atp_atributo_producto_id
                    }
                });

                await atributoProductosUpdate.update({
                    atp_atributo_producto_id : !!req.body.atp_atributo_producto_id ? req.body.atp_atributo_producto_id : atributoProductosUpdate.dataValues.atp_atributo_producto_id,
                    atp_id_atributo : !!req.body.atp_id_atributo ? req.body.atp_id_atributo : atributoProductosUpdate.dataValues.atp_id_atributo,
                    atp_id_producto : !!req.body.atp_id_producto ? req.body.atp_id_producto : atributoProductosUpdate.dataValues.atp_id_producto,
                    atp_cmm_estatus_id : !!req.body.atp_cmm_estatus_id ? req.body.atp_cmm_estatus_id : atributoProductosUpdate.dataValues.atp_cmm_estatus_id,
                    atp_usu_usuario_modificador_id : req.body.atp_usu_usuario_modificador_id,
                    updatedAt: Date()
                });
                res.status(200).send({
                    message: 'Actualización correcta de relacion atributo producto',
                    atributoProductosUpdate
                })
            }catch(e){
                res.status(500).send({
                    message: 'Error al actualizar la relacion atributo producto',
                    error: e
                });
                next(e);
            }
        },
        deleteAtributoProductos: async(req, res, next) =>
        {
            try{
                const deleteAtributosProductos = await models.AtributoProductos.findOne({
                    where: {
                        atp_atributo_producto_id: req.body.atp_atributo_producto_id
                    }
                });

                await deleteAtributosProductos.update(
                {
                  atp_cmm_estatus_id : statusControles.ATRIBUTO_PRODUCTO.ELIMINADA,
                  atp_usu_usuario_modificador_id: req.body.atp_usu_usuario_modificador_id,
                  updatedAt: Date()
                })

                res.status(200).send({
                  message: 'Eliminado relacion Atributo Productos Correctamente'
                });
                }catch(e){
                res.status(500).send({
                  message: 'Error al eliminar la relacion atributo productos',
                  e
                });
                next(e);
            }
        },
    //FIN Atributos Productos


    // SKU Atributos Valores
        getListAtributosSKUValor: async(req, res, next) =>{
            try{
                const listaAtributosSKU = await models.AtributoSkuValores.findAll(
                    {
                        where: {
                            skuav_sku_atributos_valores_id: { [Op.ne] : statusControles.ATRIBUTO_SKU_VALOR.ELIMINADA }
                        },
                        attributes: {
                            exclude : ['skuav_usu_usuario_creador_id','createdAt','skuav_usu_usuario_modificador_id','updatedAt']
                        }
                    }
                    );
                res.status(200).send({
                    message: 'Lista de Atributos Productos',
                    listaAtributosSKU
                })
            }catch(e){
                res.status(500).send({
                    message: 'Error en la petición',
                    e
                });
                next(e);
            }
        },
        createAtributoSKUValor: async(req, res, next) =>{
            try
            {
                await models.AtributoSkuValores.create(req.body)
                res.status(200).send(
                {
                    message: 'Creado valor atributo para SKU correctamente'
                })
            }
            catch(e)
            {
                res.status(500).send(
                {
                  message: 'Error al crear el valor del SKU Atributo',
                  e
                });
                next(e);
            }
        },
        updateAtributoSKUValor: async(req, res, next) =>
        {
            try{
                const atributoSkuValoresUpdate = await models.AtributoSkuValores.findOne({
                    where: {
                        skuav_sku_atributos_valores_id: req.body.skuav_sku_atributos_valores_id
                    }
                });

                await atributoSkuValoresUpdate.update(
                {
                    skuav_sku_atributos_valores_id : !!req.body.skuav_sku_atributos_valores_id ? req.body.skuav_sku_atributos_valores_id : atributoSkuValores.dataValues.skuav_sku_atributos_valores_id,
                    skuav_id_sku : !!req.body.skuav_id_sku ? req.body.skuav_id_sku : atributoSkuValores.dataValues.skuav_id_sku,
                    skuav_id_atributo_producto : !!req.body.skuav_id_atributo_producto ? req.body.skuav_id_atributo_producto : atributoSkuValores.dataValues.skuav_id_atributo_producto,
                    skuav_valor : !!req.body.skuav_valor ? req.body.skuav_valor : atributoSkuValores.dataValues.skuav_valor,
                    skuav_cmm_estatus_id : !!req.body.skuav_cmm_estatus_id ? req.body.skuav_cmm_estatus_id : atributoSkuValores.dataValues.skuav_cmm_estatus_id,
                    skuav_usu_usuario_modificador_id : req.body.skuav_usu_usuario_modificador_id,
                    updatedAt: Date()
                });
                res.status(200).send({
                    message: 'Actualización correcta del valor del atributo en SKU',
                    atributoSkuValoresUpdate
                })
            }catch(e){
                res.status(500).send({
                    message: 'Error al actualizar el valor del atributo en SKU',
                    error: e
                });
                next(e);
            }
        },
        deleteAtributoSKUValor: async(req, res, next) =>
        {
            try{
                const deleteatributoSkuValores = await models.AtributoSkuValores.findOne({
                    where: {
                        skuav_sku_atributos_valores_id: req.body.skuav_sku_atributos_valores_id
                    }
                });

                await deleteatributoSkuValores.update(
                {
                  skuav_cmm_estatus_id : statusControles.ATRIBUTO_SKU_VALOR.ELIMINADA,
                  skuav_usu_usuario_modificador_id: req.body.skuav_usu_usuario_modificador_id,
                  updatedAt: Date()
                })

                res.status(200).send({
                  message: 'Eliminado el valor del SKU atribute'
                });
                }catch(e){
                res.status(500).send({
                  message: 'Error al eliminar el valor del SKU atribute',
                  e
                });
                next(e);
            }
        },
    //FIN SKU Atributos Valores


    // Atributos Categorias
        getListAtributosCategorias: async(req, res, next) =>{
            try{
                const listaAtributosCategorias = await models.AtributoCategorias.findAll(
                    {
                        where: {
                            atc_cmm_estatus_id: { [Op.ne] : statusControles.ATRIBUTO_CATEGORIAS.ELIMINADA }
                        },
                        attributes: {
                            exclude : ['atc_usu_usuario_creador_id','createdAt','atc_usu_usuario_modificador_id','updatedAt']
                        }
                    }
                    );
                res.status(200).send({
                    message: 'Lista de Atributos Categorias',
                    listaAtributosCategorias
                })
            }catch(e){
                res.status(500).send({
                    message: 'Error en la petición',
                    e
                });
                next(e);
            }
        },
        createAtributoCategorias: async(req, res, next) =>{
            try
            {

                const constAtributoCategorias = await models.AtributoCategorias.findOne(
                {
                    where: {
                        atc_id_atributo: req.body.atc_id_atributo,
                        atc_id_categoria: req.body.atc_id_categoria,
                        atc_cmm_estatus_id: { [Op.ne] : statusControles.ATRIBUTO_CATEGORIAS.ELIMINADA }
                    },
                    attributes: {
                        exclude : ['createdAt','updatedAt']
                    }
                });


                if(constAtributoCategorias)
                {
                    res.status(500).send(
                    {
                        message: 'Relacion Atributo-Categoria ya existe',
                    });
                }
                else
                {
                    await models.AtributoCategorias.create(req.body)

                    res.status(200).send(
                    {
                        message : 'Relacion Atributo-Categoria creada con exito'
                    })
                }

                
            }
            catch(e)
            {
                res.status(500).send(
                {
                  message: 'Error al crear relacion Atributo Categorias',
                  e
                });
                next(e);
            }
        },
        updateAtributoCategorias: async(req, res, next) =>
        {
            try{
                const atributoCategoriasUpdate = await models.AtributoCategorias.findOne({
                    where: {
                        atc_atributos_categorias_id: req.body.atc_atributos_categorias_id
                    }
                });

                await atributoCategoriasUpdate.update({
                    atc_atributos_categorias_id : !!req.body.atc_atributos_categorias_id ? req.body.atc_atributos_categorias_id : atributoCategoriasUpdate.dataValues.atc_atributos_categorias_id,
                    atc_id_atributo : !!req.body.atc_id_atributo ? req.body.atc_id_atributo : atributoCategoriasUpdate.dataValues.atc_id_atributo,
                    atc_id_categoria : !!req.body.atc_id_categoria ? req.body.atc_id_categoria : atributoCategoriasUpdate.dataValues.atc_id_categoria,
                    atc_cmm_estatus_id : !!req.body.atc_cmm_estatus_id ? req.body.atc_cmm_estatus_id : atributoCategoriasUpdate.dataValues.atc_cmm_estatus_id,
                    atc_usu_usuario_modificador_id : req.body.atc_usu_usuario_modificador_id,
                    updatedAt: Date()
                });
                res.status(200).send({
                    message: 'Actualización correcta de relacion atributo categorias',
                    atributoCategoriasUpdate
                })
            }catch(e){
                res.status(500).send({
                    message: 'Error al actualizar la relacion atributo categorias',
                    error: e
                });
                next(e);
            }
        },
        deleteAtributoCategorias: async(req, res, next) =>
        {
            try{
                const deleteAtributoscategorias = await models.AtributoCategorias.findOne({
                    where: {
                        atc_atributos_categorias_id: req.body.atc_atributos_categorias_id
                    }
                });

                await deleteAtributoscategorias.update(
                {
                  atc_cmm_estatus_id : statusControles.ATRIBUTO_CATEGORIAS.ELIMINADA,
                  atc_usu_usuario_modificador_id: req.body.atc_usu_usuario_modificador_id,
                  updatedAt: Date()
                })

                res.status(200).send({
                  message: 'Eliminado relacion Atributo Categoria Correctamente'
                });
                }catch(e){
                res.status(500).send({
                  message: 'Error al eliminar la relacion atributo productos',
                  e
                });
                next(e);
            }
        },
    //FIN Atributos Categorias


    

    // Atributos Productos valores (categorias)
        getListAtributosProductosValores: async(req, res, next) =>{
            try{
                const listaAtributosProductosValores = await models.AtributoProductosValores.findAll(
                    {
                        where: {
                            pav_cmm_estatus_id: { [Op.ne] : statusControles.ATRIBUTO_PRODUCTOS_VALOR.ELIMINADA }
                        },
                        attributes: {
                            exclude : ['pav_usu_usuario_creador_id','createdAt','pav_usu_usuario_modificador_id','updatedAt']
                        }
                    }
                    );
                res.status(200).send({
                    message: 'Lista de Atributos Productos Valores',
                    listaAtributosProductosValores
                })
            }catch(e){
                res.status(500).send({
                    message: 'Error en la petición',
                    e
                });
                next(e);
            }
        },
        createAtributoProductosValores: async(req, res, next) =>{
            try
            {





                await models.AtributoProductosValores.create(req.body)
                res.status(200).send(
                {
                    message: 'Valor de Atributo Producto Creado con exito'
                })
            }
            catch(e)
            {
                res.status(500).send(
                {
                  message: 'Error al crear relacion Atributo Categorias',
                  e
                });
                next(e);
            }
        },
        updateAtributoProductosValores: async(req, res, next) =>
        {
            try{
                const atributoProductosValoresUpdate = await models.AtributoProductosValores.findOne({
                    where: {
                        pav_productos_atributos_valores_id: req.body.pav_productos_atributos_valores_id
                    }
                });

                await atributoProductosValoresUpdate.update({
                    pav_productos_atributos_valores_id : !!req.body.pav_productos_atributos_valores_id ? req.body.pav_productos_atributos_valores_id : atributoProductosValoresUpdate.dataValues.pav_productos_atributos_valores_id,
                    pav_id_producto : !!req.body.pav_id_producto ? req.body.pav_id_producto : atributoProductosValoresUpdate.dataValues.pav_id_producto,
                    pav_atributo_categoria : !!req.body.pav_atributo_categoria ? req.body.pav_atributo_categoria : atributoProductosValoresUpdate.dataValues.pav_atributo_categoria,
                    pav_valor : !!req.body.pav_valor ? req.body.pav_valor : atributoProductosValoresUpdate.dataValues.pav_valor,
                    pav_cmm_estatus_id : !!req.body.pav_cmm_estatus_id ? req.body.pav_cmm_estatus_id : atributoProductosValoresUpdate.dataValues.pav_cmm_estatus_id,
                    pav_usu_usuario_creador_id : req.body.pav_usu_usuario_creador_id,
                    updatedAt: Date()
                });
                res.status(200).send({
                    message: 'Actualización correcta del valor de atributo producto',
                    atributoProductosValoresUpdate
                })
            }catch(e){
                res.status(500).send({
                    message: 'Error al actualizar el valor del atributo producto',
                    error: e
                });
                next(e);
            }
        },
        deleteAtributoProductosValores: async(req, res, next) =>
        {
            try{
                const deleteAtributosProductosValores = await models.AtributoProductosValores.findOne({
                    where: {
                        pav_productos_atributos_valores_id: req.body.pav_productos_atributos_valores_id
                    }
                });

                await deleteAtributosProductosValores.update(
                {
                  pav_cmm_estatus_id : statusControles.ATRIBUTO_PRODUCTOS_VALOR.ELIMINADA,
                  pav_usu_usuario_modificador_id: req.body.pav_usu_usuario_modificador_id,
                  updatedAt: Date()
                })

                res.status(200).send({
                  message: 'Eliminado el atributo de producto valor'
                });
                }catch(e){
                res.status(500).send({
                  message: 'Error al eliminar el atributo producto valor',
                  e
                });
                next(e);
            }
        }
    //FIN Atributos Categorias


}