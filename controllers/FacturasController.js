import models from '../models';
import statusControles from '../mapeos/mapeoControlesMaestrosMultiples';
const { Op } = require("sequelize");
import {  Sequelize } from 'sequelize';
const sequelize = new Sequelize(process.env.POSTGRESQL);
export default {
   


    getListFacturas: async(req, res, next) =>{
        try{
            const listaFacturas = await models.Facturas.findAll(
            {
                exclude: ['fac_usu_usuario_creador_id','createdAt','fac_usu_usuario_modificador_id','updatedAt']
            });

            res.status(200).send({
                message: 'Lista de Facturas',
                listaFacturas
            })
        }catch(e){
            res.status(500).send({
                message: 'Error en la petición',
                e
            });
            next(e);
        }
    },
    getListByIDUsuario: async(req, res, next) =>{
        try{
            
            //Buscara el rol del usuario preguntado
            const constUsuarios = await models.Usuario.findOne(
            {
                where: {
                    usu_usuario_id: req.body.usu_usuario_id
                },
                attributes: ['usu_usuario_id', 'usu_rol_rol_id'],
                include: [
                    {
                        model: models.Rol,
                        attributes: {
                            exclude: ['createdAt', 'updatedAt']
                        }
                    }
                ]
            });

            console.log(constUsuarios)
            //Si el usuario existe y tiene rol continuara
            if(constUsuarios)
            {
                //Si el usuario es de tipo admin traera todas las facturas del sistema
                if(constUsuarios.dataValues.role.rol_nombre == "Administrador")
                {
                    //OBTENER TODAS LAS FACTURAS DEL SISTEMA ORDENADAS POR LA ULTIMA PRIMERO
                    const listaFacturas = await models.Facturas.findAll(
                    {
                        exclude: ['fac_usu_usuario_creador_id','createdAt','fac_usu_usuario_modificador_id','updatedAt'],
                        order: [
                            ['fac_facturas_id', 'DESC']
                        ],
                    });

                    res.status(200).send({
                        message: 'Facturas de Administrador',
                        listaFacturas
                    })

                }
                //Si el usuario es un gerente buscara a sus vendedores asignados y luego sus SN
                else if (constUsuarios.dataValues.role.rol_nombre == "Gerente")
                {

                    var id_usuario_gerente = constUsuarios.dataValues.usu_usuario_id

                    //OBTENER TODAS LAS FACTURAS DEL SISTEMA ORDENADAS POR LA ULTIMA PRIMERO
                    const ListaDeVendedoresYSuCardcode = await sequelize.query(`
                        select usu_usuario_id, sn_socios_negocio_id, sn_cardcode from(
                            select * from 
                            (
                                select 
                                    * 
                                from 
                                    (
                                        select 
                                            usu_usuario_id 
                                        from 
                                            usuarios u2
                                        where usu_usuario_creado_por_id = `+id_usuario_gerente+`
                                    )     as table1
                            ) tb1 
                            left join usuarios_socios_de_negocio usdn on tb1.usu_usuario_id = usdn.usn_usu_usuario_id
                            where usdn.usn_usu_usuario_id in (tb1.usu_usuario_id)
                        ) t3
                        left join socios_negocio sn on t3.usn_sn_socio_de_negocio_id = sn.sn_socios_negocio_id 
                        `,
                    { 
                        type: sequelize.QueryTypes.SELECT 
                    });

                    var listaCardCodes = '';
                    for (var i = 0; i < ListaDeVendedoresYSuCardcode.length; i++) 
                    {
                        //console.log(ListaDeVendedoresYSuCardcode[i].sn_cardcode)


                        listaCardCodes = listaCardCodes + "'"+  ListaDeVendedoresYSuCardcode[i].sn_cardcode  + "'"

                        //console.log(ListaDeVendedoresYSuCardcode.length)

                        if(i+1 < ListaDeVendedoresYSuCardcode.length)
                        {
                            listaCardCodes = listaCardCodes + ","
                        }
                        else
                        {
                            
                        }

                    }



                    
                    const constFacturas = await models.Facturas.findAll({
                        where: {
                            [Op.or]: [
                                Sequelize.literal("facturas.fac_cardcode in (" + listaCardCodes + ")"),
                            ]
                            
                        },
                        attributes: 
                        {
                            exclude: ['createdAt', 'updatedAt']
                        }
                        
                    })




                    res.status(200).send({
                        message: 'Facturas de Gerente',
                        constFacturas
                    })
                }

                //Si el usuario es vendedor buscara solo los cardcodes asignados a un vendedor
                else if (constUsuarios.dataValues.role.rol_nombre == "Vendedor")
                {

                    var id_usuario_Vendedor = constUsuarios.dataValues.usu_usuario_id


                    // const constUsuariosSociosDeNegocios = await models.UsuariosSociosDeNegocios.findAll({
                    //     where: {
                    //         usn_usu_usuario_id : id_usuario_Vendedor
                    //     }
                    // });


                    //OBTENER TODAS LAS FACTURAS DEL SISTEMA ORDENADAS POR LA ULTIMA PRIMERO
                    const ListaDeVendedoresYSuCardcode = await sequelize.query(`
                        select 
                            usdn.usn_usu_usuario_id, usn_sn_socio_de_negocio_id,sn.sn_socios_negocio_id, sn.sn_cardcode 
                            from usuarios_socios_de_negocio usdn
                            left join socios_negocio sn on usdn.usn_sn_socio_de_negocio_id = sn.sn_socios_negocio_id 
                            where 
                                usdn.usn_usu_usuario_id = `+id_usuario_Vendedor+`
                        `,
                    { 
                        type: sequelize.QueryTypes.SELECT 
                    });


                    var listaCardCodes = '';
                    for (var i = 0; i < ListaDeVendedoresYSuCardcode.length; i++) 
                    {
                        //console.log(ListaDeVendedoresYSuCardcode[i])


                        listaCardCodes = listaCardCodes + "'"+  ListaDeVendedoresYSuCardcode[i].sn_cardcode  + "'"

                        //console.log(ListaDeVendedoresYSuCardcode.length)

                        if(i+1 < ListaDeVendedoresYSuCardcode.length)
                        {
                            listaCardCodes = listaCardCodes + ","
                        }
                        else
                        {
                            
                        }

                    }


                    const constFacturas = await models.Facturas.findAll({
                        where: {
                            [Op.or]: [
                                Sequelize.literal("facturas.fac_cardcode in (" + listaCardCodes + ")"),
                            ]
                            
                        },
                        attributes: 
                        {
                            exclude: ['createdAt', 'updatedAt']
                        }
                        
                    })




                    res.status(200).send({
                        message: 'Facturas de Gerente',
                        constFacturas
                    })
                }



            }
            else
            {
                res.status(200).send({
                    message: 'id de usuario invalido'
                })
            }




            
        }catch(e){
            res.status(500).send({
                message: 'Error en la petición',
                e
            });
            next(e);
        }
    },
    getListByCardCode: async(req, res, next) =>{
        try{

            const constFacturas = await models.Facturas.findAll({
                where: {
                    [Op.or]: [
                        Sequelize.literal("facturas.fac_cardcode in ('" + req.body.sn_cardcode + "')"),
                    ]
                    
                },
                attributes: 
                {
                    exclude: ['createdAt', 'updatedAt']
                }
                
            })

            res.status(200).send({
                message: 'Lista de facturas por CARDCODE',
                constFacturas
            })
           

        }catch(e){
            res.status(500).send({
                message: 'Error en la petición',
                e
            });
            next(e);
        }
    },




    //API CON TOKEN DE SN
    getListByCardCode_SnToken: async(req, res, next) =>{
        try{

            const constFacturas = await models.Facturas.findAll({
                where: {
                    [Op.or]: [
                        Sequelize.literal("facturas.fac_cardcode in ('" + req.body.sn_cardcode + "')"),
                    ]
                },
                attributes: 
                {
                    exclude: ['createdAt', 'updatedAt']
                }
            })

            res.status(200).send({
                message: 'Lista de facturas por CARDCODE',
                constFacturas
            })

        }catch(e){
            res.status(500).send({
                message: 'Error en la petición',
                e
            });
            next(e);
        }
    },
}