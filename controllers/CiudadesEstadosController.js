import models from '../models';
import statusControles from '../mapeos/mapeoControlesMaestrosMultiples';
const { Op } = require("sequelize");
import {  Sequelize } from 'sequelize';
const sequelize = new Sequelize(process.env.POSTGRESQL);
import XLSX from  'xlsx';

export default {

    LoadExcelCityNamesPart1: async(req, res, next) =>{
        try{
            const estados = await models.Estado.findAll({
                attributes: {
                    exclude: ['estpa_usu_usuario_creador_id','createdAt','estpa_usu_usuario_modificador_id','updatedAt', "estpa_pais_pais_id"]
                }
            })

            var AGS,
                BC,
                BCS,
                CAM,
                CDM,
                CHI,
                CHS,
                COA,
                COL,
                DF,
                DUR,
                FL,
                GRO,
                GTO,
                HID,
                JAL,
                MCH,
                MEX,
                MOR,
                NAY,
                NL,
                OAX,
                ONT,
                PUE,
                QR,
                QUE,
                SIN,
                SLP,
                SON,
                TAB,
                TAM,
                TLA,
                VER,
                YUC,
                ZAC = ''


            for(var h = 0; h < estados.length; h++)
            {
                switch(estados[h].dataValues.estpa_codigo_estado)
                {
                    case 'AGS':
                        AGS = estados[h].dataValues.estpa_estado_pais_id
                    break;

                    case 'BC':
                        BC = estados[h].dataValues.estpa_estado_pais_id
                    break;

                    case 'BCS':
                        BCS = estados[h].dataValues.estpa_estado_pais_id
                    break;

                    case 'CAM':
                        CAM = estados[h].dataValues.estpa_estado_pais_id
                    break;

                    case 'CHI':
                        CHI = estados[h].dataValues.estpa_estado_pais_id
                    break;

                    case 'CHS':
                        CHS = estados[h].dataValues.estpa_estado_pais_id
                    break;

                    case 'COA':
                        COA = estados[h].dataValues.estpa_estado_pais_id
                    break;

                    case 'COL':
                        COL = estados[h].dataValues.estpa_estado_pais_id
                    break;

                    case 'DF':
                        DF = estados[h].dataValues.estpa_estado_pais_id
                    break;

                    case 'DUR':
                        DUR = estados[h].dataValues.estpa_estado_pais_id
                    break;

                    case 'FL':
                        FL = estados[h].dataValues.estpa_estado_pais_id
                    break;

                    case 'GRO':
                        GRO = estados[h].dataValues.estpa_estado_pais_id
                    break;

                    case 'GTO':
                        GTO = estados[h].dataValues.estpa_estado_pais_id
                    break;

                    case 'HID':
                        HID = estados[h].dataValues.estpa_estado_pais_id
                    break;

                    case 'JAL':
                        JAL = estados[h].dataValues.estpa_estado_pais_id
                    break;

                    case 'MEX':
                        MEX = estados[h].dataValues.estpa_estado_pais_id
                    break;

                    case 'CDM':
                        CDM = estados[h].dataValues.estpa_estado_pais_id
                    break;

                    case 'MCH':
                        MCH = estados[h].dataValues.estpa_estado_pais_id
                    break;

                    case 'MOR':
                        MOR = estados[h].dataValues.estpa_estado_pais_id
                    break;

                    case 'NAY':
                        NAY = estados[h].dataValues.estpa_estado_pais_id
                    break;

                    case 'NL':
                        NL = estados[h].dataValues.estpa_estado_pais_id
                    break;

                    case 'OAX':
                        OAX = estados[h].dataValues.estpa_estado_pais_id
                    break;
                    
                    case 'ONT':
                        ONT = estados[h].dataValues.estpa_estado_pais_id
                    break;

                    case 'PUE':
                        PUE = estados[h].dataValues.estpa_estado_pais_id
                    break;

                    case 'QUE':
                        QUE = estados[h].dataValues.estpa_estado_pais_id
                    break;

                    case 'QR':
                        QR = estados[h].dataValues.estpa_estado_pais_id
                    break;

                    case 'SIN':
                        SIN = estados[h].dataValues.estpa_estado_pais_id
                    break;

                    case 'SLP':
                        SLP = estados[h].dataValues.estpa_estado_pais_id
                    break;

                    case 'SON':
                        SON = estados[h].dataValues.estpa_estado_pais_id
                    break;

                    case 'TAB':
                        TAB = estados[h].dataValues.estpa_estado_pais_id
                    break;

                    case 'TAM':
                        TAM = estados[h].dataValues.estpa_estado_pais_id
                    break;

                    case 'TLA':
                        TLA = estados[h].dataValues.estpa_estado_pais_id
                    break;

                    case 'VER':
                        VER = estados[h].dataValues.estpa_estado_pais_id
                    break;

                    case 'YUC':
                        YUC = estados[h].dataValues.estpa_estado_pais_id
                    break;

                    case 'ZAC':
                        ZAC = estados[h].dataValues.estpa_estado_pais_id
                    break;
                }
            }

            var workbook = XLSX.readFile('public/codigosPostales/Estados_ciudades_mx_part_1.xlsx');
            var sheet_name_list = workbook.SheetNames;
            var xlData = XLSX.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]]);

            for (var i = 0; i < xlData.length; i++) 
            {  
                var Ciudad = xlData[i].Ciudad
                var Estado = xlData[i].Estado
                var Estado_ID = ''

                switch(Estado)
                {
                    case 'Aguascalientes':
                        Estado_ID = AGS
                    break;

                    case 'Baja California':
                        Estado_ID = BC
                    break;

                    case 'Baja California Sur':
                        Estado_ID = BCS
                    break;

                    case 'Campeche':
                        Estado_ID = CAM
                    break;

                    case 'Chihuahua':
                        Estado_ID = CHI
                    break;

                    case 'Chiapas':
                        Estado_ID = CHS
                    break;

                    case 'Coahuila De Zaragoza':
                        Estado_ID = COA
                    break;

                    case 'Colima':
                        Estado_ID = COL
                    break;

                    case 'Ciudad de Mexico':
                        Estado_ID = CDM
                    break;

                    case 'Durango':
                        Estado_ID = DUR
                    break;

                    case 'Guerrero':
                        Estado_ID = GRO
                    break;

                    case 'Guanajuato':
                        Estado_ID = GTO
                    break;

                    case 'Hidalgo':
                        Estado_ID = HID
                    break;

                    case 'Jalisco':
                        Estado_ID = JAL
                    break;

                    case 'Mexico':
                        Estado_ID = MEX
                    break;

                    case 'México':
                        Estado_ID = MEX
                    break;

                    case 'Michoacan De Ocampo':
                        Estado_ID = MCH
                    break;

                    case 'Michoacán de Ocampo':
                        Estado_ID = MCH
                    break;

                    case 'Morelos':
                        Estado_ID = MOR
                    break;

                    case 'Nayarit':
                        Estado_ID = NAY
                    break;

                    case 'Nuevo Leon':
                        Estado_ID = NL
                    break;

                    case 'Oaxaca':
                        Estado_ID = OAX
                    break;

                    case 'Puebla':
                        Estado_ID = PUE
                    break;

                    case 'Queretaro':
                        Estado_ID = QUE
                    break;

                    case 'Quintana Roo':
                        Estado_ID = QR
                    break;

                    case 'Sinaloa':
                        Estado_ID = SIN
                    break;

                    case 'San Luis Potosí':
                        Estado_ID = SLP
                    break;

                    case 'San Luis Potosi':
                        Estado_ID = SLP
                    break;

                    case 'Sonora':
                        Estado_ID = SON
                    break;

                    case 'Tabasco':
                        Estado_ID = TAB
                    break;

                    case 'Tamaulipas':
                        Estado_ID = TAM
                    break;

                    case 'Tlaxcala':
                        Estado_ID = TLA
                    break;

                    case 'Veracruz De Ignacio De La Llave':
                        Estado_ID = VER
                    break;

                    case 'Yucatan':
                        Estado_ID = YUC
                    break;

                    case 'Zacatecas':
                        Estado_ID = ZAC
                    break;
                }

                if(Ciudad != '' && Estado_ID != '')
                {
                    const constCiudadesEstados = await models.CiudadesEstados.findOne(
                    {
                        where: {
                            city_ciudad: Ciudad,
                            city_estpa_estado_pais_id: Estado_ID
                        }
                    })

                    if(constCiudadesEstados) {
                    }
                    else //Crear
                    {
                        const bodyCreate = {
                            "city_ciudad": Ciudad,
                            "city_estpa_estado_pais_id": Estado_ID,
                            "city_usu_usuario_creador_id": 1
                        };
                             
                        await models.CiudadesEstados.create(bodyCreate);
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
    LoadExcelCityNamesPart2: async(req, res, next) =>{
        try{
            const estados = await models.Estado.findAll({
                attributes: {
                    exclude: ['estpa_usu_usuario_creador_id','createdAt','estpa_usu_usuario_modificador_id','updatedAt', "estpa_pais_pais_id"]
                }
            })

            var AGS,
                BC,
                BCS,
                CAM,
                CDM,
                CHI,
                CHS,
                COA,
                COL,
                DF,
                DUR,
                FL,
                GRO,
                GTO,
                HID,
                JAL,
                MCH,
                MEX,
                MOR,
                NAY,
                NL,
                OAX,
                ONT,
                PUE,
                QR,
                QUE,
                SIN,
                SLP,
                SON,
                TAB,
                TAM,
                TLA,
                VER,
                YUC,
                ZAC = ''


            for(var h = 0; h < estados.length; h++)
            {
                switch(estados[h].dataValues.estpa_codigo_estado)
                {
                    case 'AGS':
                        AGS = estados[h].dataValues.estpa_estado_pais_id
                    break;

                    case 'BC':
                        BC = estados[h].dataValues.estpa_estado_pais_id
                    break;

                    case 'BCS':
                        BCS = estados[h].dataValues.estpa_estado_pais_id
                    break;

                    case 'CAM':
                        CAM = estados[h].dataValues.estpa_estado_pais_id
                    break;

                    case 'CHI':
                        CHI = estados[h].dataValues.estpa_estado_pais_id
                    break;

                    case 'CHS':
                        CHS = estados[h].dataValues.estpa_estado_pais_id
                    break;

                    case 'COA':
                        COA = estados[h].dataValues.estpa_estado_pais_id
                    break;

                    case 'COL':
                        COL = estados[h].dataValues.estpa_estado_pais_id
                    break;

                    case 'DF':
                        DF = estados[h].dataValues.estpa_estado_pais_id
                    break;

                    case 'DUR':
                        DUR = estados[h].dataValues.estpa_estado_pais_id
                    break;

                    case 'FL':
                        FL = estados[h].dataValues.estpa_estado_pais_id
                    break;

                    case 'GRO':
                        GRO = estados[h].dataValues.estpa_estado_pais_id
                    break;

                    case 'GTO':
                        GTO = estados[h].dataValues.estpa_estado_pais_id
                    break;

                    case 'HID':
                        HID = estados[h].dataValues.estpa_estado_pais_id
                    break;

                    case 'JAL':
                        JAL = estados[h].dataValues.estpa_estado_pais_id
                    break;

                    case 'MEX':
                        MEX = estados[h].dataValues.estpa_estado_pais_id
                    break;

                    case 'CDM':
                        CDM = estados[h].dataValues.estpa_estado_pais_id
                    break;

                    case 'MCH':
                        MCH = estados[h].dataValues.estpa_estado_pais_id
                    break;

                    case 'MOR':
                        MOR = estados[h].dataValues.estpa_estado_pais_id
                    break;

                    case 'NAY':
                        NAY = estados[h].dataValues.estpa_estado_pais_id
                    break;

                    case 'NL':
                        NL = estados[h].dataValues.estpa_estado_pais_id
                    break;

                    case 'OAX':
                        OAX = estados[h].dataValues.estpa_estado_pais_id
                    break;
                    
                    case 'ONT':
                        ONT = estados[h].dataValues.estpa_estado_pais_id
                    break;

                    case 'PUE':
                        PUE = estados[h].dataValues.estpa_estado_pais_id
                    break;

                    case 'QUE':
                        QUE = estados[h].dataValues.estpa_estado_pais_id
                    break;

                    case 'QR':
                        QR = estados[h].dataValues.estpa_estado_pais_id
                    break;

                    case 'SIN':
                        SIN = estados[h].dataValues.estpa_estado_pais_id
                    break;

                    case 'SLP':
                        SLP = estados[h].dataValues.estpa_estado_pais_id
                    break;

                    case 'SON':
                        SON = estados[h].dataValues.estpa_estado_pais_id
                    break;

                    case 'TAB':
                        TAB = estados[h].dataValues.estpa_estado_pais_id
                    break;

                    case 'TAM':
                        TAM = estados[h].dataValues.estpa_estado_pais_id
                    break;

                    case 'TLA':
                        TLA = estados[h].dataValues.estpa_estado_pais_id
                    break;

                    case 'VER':
                        VER = estados[h].dataValues.estpa_estado_pais_id
                    break;

                    case 'YUC':
                        YUC = estados[h].dataValues.estpa_estado_pais_id
                    break;

                    case 'ZAC':
                        ZAC = estados[h].dataValues.estpa_estado_pais_id
                    break;
                }
            }

            var workbook = XLSX.readFile('public/codigosPostales/Estados_ciudades_mx_part_2.xlsx');
            var sheet_name_list = workbook.SheetNames;
            var xlData = XLSX.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]]);

            for (var i = 0; i < xlData.length; i++) 
            {  
                var Ciudad = xlData[i].Ciudad
                var Estado = xlData[i].Estado
                var Estado_ID = ''

                switch(Estado)
                {
                    case 'Aguascalientes':
                        Estado_ID = AGS
                    break;

                    case 'Baja California':
                        Estado_ID = BC
                    break;

                    case 'Baja California Sur':
                        Estado_ID = BCS
                    break;

                    case 'Campeche':
                        Estado_ID = CAM
                    break;

                    case 'Chihuahua':
                        Estado_ID = CHI
                    break;

                    case 'Chiapas':
                        Estado_ID = CHS
                    break;

                    case 'Coahuila De Zaragoza':
                        Estado_ID = COA
                    break;

                    case 'Colima':
                        Estado_ID = COL
                    break;

                    case 'Ciudad de Mexico':
                        Estado_ID = CDM
                    break;

                    case 'Durango':
                        Estado_ID = DUR
                    break;

                    case 'Guerrero':
                        Estado_ID = GRO
                    break;

                    case 'Guanajuato':
                        Estado_ID = GTO
                    break;

                    case 'Hidalgo':
                        Estado_ID = HID
                    break;

                    case 'Jalisco':
                        Estado_ID = JAL
                    break;

                    case 'Mexico':
                        Estado_ID = MEX
                    break;

                    case 'México':
                        Estado_ID = MEX
                    break;

                    case 'Michoacan De Ocampo':
                        Estado_ID = MCH
                    break;

                    case 'Michoacán de Ocampo':
                        Estado_ID = MCH
                    break;

                    case 'Morelos':
                        Estado_ID = MOR
                    break;

                    case 'Nayarit':
                        Estado_ID = NAY
                    break;

                    case 'Nuevo Leon':
                        Estado_ID = NL
                    break;

                    case 'Oaxaca':
                        Estado_ID = OAX
                    break;

                    case 'Puebla':
                        Estado_ID = PUE
                    break;

                    case 'Queretaro':
                        Estado_ID = QUE
                    break;

                    case 'Quintana Roo':
                        Estado_ID = QR
                    break;

                    case 'Sinaloa':
                        Estado_ID = SIN
                    break;

                    case 'San Luis Potosí':
                        Estado_ID = SLP
                    break;

                    case 'San Luis Potosi':
                        Estado_ID = SLP
                    break;

                    case 'Sonora':
                        Estado_ID = SON
                    break;

                    case 'Tabasco':
                        Estado_ID = TAB
                    break;

                    case 'Tamaulipas':
                        Estado_ID = TAM
                    break;

                    case 'Tlaxcala':
                        Estado_ID = TLA
                    break;

                    case 'Veracruz De Ignacio De La Llave':
                        Estado_ID = VER
                    break;

                    case 'Yucatan':
                        Estado_ID = YUC
                    break;

                    case 'Zacatecas':
                        Estado_ID = ZAC
                    break;
                }

                if(Ciudad != '' && Estado_ID != '')
                {
                    const constCiudadesEstados = await models.CiudadesEstados.findOne(
                    {
                        where: {
                            city_ciudad: Ciudad,
                            city_estpa_estado_pais_id: Estado_ID
                        }
                    })

                    if(constCiudadesEstados) {
                    }
                    else //Crear
                    {
                        const bodyCreate = {
                            "city_ciudad": Ciudad,
                            "city_estpa_estado_pais_id": Estado_ID,
                            "city_usu_usuario_creador_id": 1
                        };
                             
                        await models.CiudadesEstados.create(bodyCreate);
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
    LoadExcelCityCp_Part1: async(req, res, next) =>{
        try{
            var workbook = XLSX.readFile('public/codigosPostales/Estados_ciudades_mx_part_1.xlsx');
            var sheet_name_list = workbook.SheetNames;
            var xlData = XLSX.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]]);

            for (var i = 0; i < xlData.length; i++) 
            {  
                var Codigo_Postal = xlData[i].Codigo_Postal
                var Ciudad = xlData[i].Ciudad
                var Estado = xlData[i].Estado

                const constCiudadesEstadosID = await models.CiudadesEstados.findOne(
                {
                    where: {
                        city_ciudad: Ciudad
                    }
                })

                var Estado_ID = constCiudadesEstadosID.city_ciudades_estados_id

                if(Ciudad != '' && Estado_ID != '' && Codigo_Postal != '')
                {
                    const constCiudadesEstadosCp = await models.CiudadesEstadosCp.findOne(
                    {
                        where: {
                            citycp_city_ciudades_estados_id: Estado_ID,
                            citycp_cp: Codigo_Postal
                        }
                    })

                    if(constCiudadesEstadosCp) {
                    }
                    else //Crear
                    {
                        const bodyCreate = {
                            "citycp_city_ciudades_estados_id": Estado_ID,
                            "citycp_cp": Codigo_Postal,
                            "citycp_usu_usuario_creador_id": 1
                        };
                        
                        await models.CiudadesEstadosCp.create(bodyCreate);
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
    LoadExcelCityCp_Part2: async(req, res, next) =>{
        try{
            var workbook = XLSX.readFile('public/codigosPostales/Estados_ciudades_mx_part_2.xlsx');
            var sheet_name_list = workbook.SheetNames;
            var xlData = XLSX.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]]);

            for (var i = 0; i < xlData.length; i++) 
            {  
                var Codigo_Postal = xlData[i].Codigo_Postal
                var Ciudad = xlData[i].Ciudad
                var Estado = xlData[i].Estado

                const constCiudadesEstadosID = await models.CiudadesEstados.findOne(
                {
                    where: {
                        city_ciudad: Ciudad
                    }
                })

                var Estado_ID = constCiudadesEstadosID.city_ciudades_estados_id

                if(Ciudad != '' && Estado_ID != '' && Codigo_Postal != '')
                {
                    const constCiudadesEstadosCp = await models.CiudadesEstadosCp.findOne(
                    {
                        where: {
                            citycp_city_ciudades_estados_id: Estado_ID,
                            citycp_cp: Codigo_Postal
                        }
                    })

                    if(constCiudadesEstadosCp) {
                    }
                    else //Crear
                    {
                        const bodyCreate = {
                            "citycp_city_ciudades_estados_id": Estado_ID,
                            "citycp_cp": Codigo_Postal,
                            "citycp_usu_usuario_creador_id": 1
                        };
                        
                        await models.CiudadesEstadosCp.create(bodyCreate);
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
    getListByEstado: async(req, res, next) =>{
        try{
            var estado_id = req.body.estpa_estado_pais_id
            var varlimit = req.body.limite
            var varoffset = 0 + (req.body.pagina) * varlimit

            const constCiudadesEstados = await models.CiudadesEstados.findAndCountAll(
            {
                where: {
                    city_estpa_estado_pais_id: estado_id
                },
                attributes: {
                    exclude: ['city_usu_usuario_creador_id','createdAt','updatedAt']
                },
                limit: varlimit,
                offset: varoffset
            });

            for (var i = 0; i < constCiudadesEstados.rows.length; i++) 
            {
                const constCiudadesEstadosCp = await models.CiudadesEstadosCp.findAll(
                {
                    where: {
                        citycp_city_ciudades_estados_id: constCiudadesEstados.rows[i].dataValues.city_ciudades_estados_id
                    },
                    attributes: {
                        exclude: ['citycp_usu_usuario_creador_id','createdAt','updatedAt']
                    }
                });

                if(constCiudadesEstadosCp)
                {
                    constCiudadesEstados.rows[i].dataValues.ciudades = constCiudadesEstadosCp
                }
                else
                {
                    constCiudadesEstados.rows[i].dataValues.ciudades = []
                }

            }

            res.status(200).send({
                message: "Finalizo con exito",
                constCiudadesEstados
            })
        }catch(e){
            res.status(500).send({
                message: 'Error en la petición',
                e
            });
            next(e);
        }
    },
    getListByEstadoJustCityNames: async(req, res, next) =>{
        try{
            var estado_id = req.body.estpa_estado_pais_id
            var varlimit = req.body.limite
            var varoffset = 0 + (req.body.pagina) * varlimit

            const constCiudadesEstados = await models.CiudadesEstados.findAndCountAll(
            {
                where: {
                    city_estpa_estado_pais_id: estado_id
                },
                attributes: {
                    exclude: ['city_ciudades_estados_id', 'city_usu_usuario_creador_id', 'city_codigo_postal','createdAt','updatedAt']
                },
                group: ['city_ciudad', 'city_estpa_estado_pais_id'],
                limit: varlimit,
                offset: varoffset
            });

            res.status(200).send({
                message: "Finalizo con exito",
                constCiudadesEstados
            })
        }catch(e){
            res.status(500).send({
                message: 'Error en la petición',
                e
            });
            next(e);
        }
    },
    getListCpsByCiudad: async(req, res, next) =>{
        try{
            var varlimit = req.body.limite
            var varoffset = 0 + (req.body.pagina) * varlimit

            const constCiudadesEstados = await models.CiudadesEstados.findOne(
            {
                where: {
                    city_ciudades_estados_id: req.body.city_ciudades_estados_id
                },
                attributes: {
                    exclude: ['city_usu_usuario_creador_id','createdAt','updatedAt']
                }
            });

            const constCiudadesEstadosCp = await models.CiudadesEstadosCp.findAll(
            {
                where: {
                    citycp_city_ciudades_estados_id: constCiudadesEstados.city_ciudades_estados_id
                },
                attributes: {
                    exclude: ['city_usu_usuario_creador_id','createdAt','updatedAt']
                }
            });

            constCiudadesEstados.dataValues.codigos_postales = constCiudadesEstadosCp


            res.status(200).send({
                message: "Finalizo con exito",
                constCiudadesEstados
            })
        }catch(e){
            res.status(500).send({
                message: 'Error en la petición',
                e
            });
            next(e);
        }
    },
    getInfoByCp: async(req, res, next) =>{
        try{

            const constCiudadesEstadosCp = await models.CiudadesEstadosCp.findOne(
            {
                where: {
                    citycp_cp: req.params.citycp_cp
                },
                attributes: {
                    exclude: ['city_usu_usuario_creador_id','createdAt','updatedAt']
                }
            });

            if(constCiudadesEstadosCp)
            {
                const constCiudadesEstados = await models.CiudadesEstados.findOne(
                {
                    where: {
                        city_ciudades_estados_id: constCiudadesEstadosCp.dataValues.citycp_city_ciudades_estados_id
                    },
                    attributes: {
                        exclude: ['city_usu_usuario_creador_id','createdAt','updatedAt']
                    }
                });

                if(constCiudadesEstados)
                {
                    constCiudadesEstados.dataValues.codigos_postales = constCiudadesEstadosCp
                }
                res.status(200).send({
                    message: "Finalizo con exito",
                    constCiudadesEstados
                })
            }
            else
            {
                const constCiudadesEstados = []
                res.status(200).send({
                    message: "No se encontro nada",
                    constCiudadesEstados
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
    createCiudadEstado: async(req, res, next) =>{
        try{
            const constCiudadesEstados = await models.CiudadesEstados.findOne(
            {
                where: {
                    city_ciudad: req.body.city_ciudad,
                    city_estpa_estado_pais_id: req.body.city_estpa_estado_pais_id,
                    city_codigo_postal: req.body.city_codigo_postal
                }
            })

            if(constCiudadesEstados) 
            {
                res.status(200).send({
                    message: 'Ciudad y Codigo Postal ya existen'
                })
            }
            else //Crear
            {
                const bodyCreate = {
                    "city_ciudad":  req.body.city_ciudad,
                    "city_estpa_estado_pais_id": req.body.city_estpa_estado_pais_id,
                    "city_codigo_postal": req.body.city_codigo_postal,
                    "city_usu_usuario_creador_id": req.body.city_usu_usuario_creador_id
                };
                     
                await models.CiudadesEstados.create(req.body);

                res.status(200).send({
                    message: 'Creado con exito'
                })
            }
        }catch(e){
            res.status(500).send({
                message: 'Error al crear la Socio de Negocio',
                e
            });
            next(e);
        }
    },
    updateCiudadEstado: async(req, res, next) =>{
        try{

            //validar si existe
            const constCiudadesEstados = await models.CiudadesEstados.findOne(
            {
                where: {
                    city_ciudad: req.body.city_ciudad,
                    city_estpa_estado_pais_id: req.body.city_estpa_estado_pais_id,
                    city_codigo_postal: req.body.city_codigo_postal
                }
            })

            if(constCiudadesEstados)
            {
                res.status(200).send({
                    message: 'Error al actualizar: El registro ya existe'
                })
            }
            else
            {
                const constCiudadesEstados2 = await models.CiudadesEstados.findOne({
                    where: {
                        city_ciudades_estados_id : req.body.city_ciudades_estados_id
                    }
                });

                await constCiudadesEstados2.update({
                    city_ciudad: !!req.body.city_ciudad ? req.body.city_ciudad : constCiudadesEstados2.dataValues.city_ciudad,
                    city_estpa_estado_pais_id: !!req.body.city_estpa_estado_pais_id ? req.body.city_estpa_estado_pais_id : constCiudadesEstados2.dataValues.city_estpa_estado_pais_id,
                    city_codigo_postal: !!req.body.city_codigo_postal ? req.body.city_codigo_postal : constCiudadesEstados2.dataValues.city_codigo_postal,
                    city_usu_usuario_creador_id: !!req.body.city_usu_usuario_creador_id ? req.body.city_usu_usuario_creador_id : constCiudadesEstados2.dataValues.city_usu_usuario_creador_id,
                    updatedAt: Date()
                });

                res.status(200).send({
                    message: 'Actualización correcta'
                })
            }
            
        }catch(e){
            res.status(500).send({
                message: 'Error al actualizar datos',
                e
            });
            next(e);
        }
    },
    deleteCiudadEstado: async(req, res, next) =>
    {
        try{
            const constCiudadesEstados = await models.CiudadesEstados.findOne({
                where: {
                    city_ciudades_estados_id : req.body.city_ciudades_estados_id
                }
            });

            await constCiudadesEstados.destroy()

            res.status(200).send({
              message: 'Eliminado correctamente'
            });

            }
        catch(e){
            res.status(500).send({
              message: 'Error al eliminar',
              e
            });
            next(e);
        }
    },

}