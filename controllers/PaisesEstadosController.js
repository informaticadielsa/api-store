import models from '../models';
import statusControles from '../mapeos/mapeoControlesMaestrosMultiples';
const { Op } = require("sequelize");
import {  Sequelize } from 'sequelize';
import XLSX from  'xlsx';

export default{
    getListPais: async(req, res, next) =>{
        try{
            const paises = await models.Pais.findAll({
                attributes: {
                    exclude: ['pais_usu_usuario_creador_id','createdAt','pais_usu_modificado_por_id','updatedAt']
                }
            });
            res.status(200).send({
                message: 'Lista paises',
                paises
            })
        }catch(e){
            res.status(500).send({
                message: 'Error al obtener lista de paises',
                e
            });
            next(e);
        }
    },
    getListEstadoByIdPais: async(req, res, next) =>{
        try{
            const estados = await models.Estado.findAll({
                where: {
                    estpa_pais_pais_id: req.params.id
                },
                attributes: {
                    exclude: ['estpa_usu_usuario_creador_id','createdAt','estpa_usu_usuario_modificador_id','updatedAt']
                }
            })
            res.status(200).send({
                message: 'Lista de estados',
                estados
            });
        }catch(e){
            res.status(500).send({
                message: 'Error al obtener lista de estados',
                e
            });
            next(e);
        }
    },
    codigoPostales: async(req, res, next) =>{
            try{


                var workbook = XLSX.readFile('public/codigosPostales/MexicoCp.xls');
                var sheet_name_list = workbook.SheetNames;
                var xlData = XLSX.utils.sheet_to_json(workbook.Sheets[sheet_name_list[1]]);
                // console.log(sheet_name_list);


                console.log(sheet_name_list[0])


                //console.log(xlData.length)

                for (var j = 0; j < sheet_name_list.length; j++) 
                { 
                    var xlData = XLSX.utils.sheet_to_json(workbook.Sheets[sheet_name_list[j]]);
                    for (var i = 0; i < xlData.length; i++) 
                    {   
                        console.log(i)
                        var codigoPostal = xlData[i].c_CodigoPostal
                        var id_estado = xlData[i].c_Estado
                        var c_frontera = xlData[i].c_frontera

                        
                        codigoPostal = codigoPostal.toString()
                        console.log(codigoPostal)
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
                            console.log(bodyUpdate)
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

};