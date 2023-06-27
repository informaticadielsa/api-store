import routerx from 'express-promise-router';
import CiudadesEstadosController from '../controllers/CiudadesEstadosController';
import auth from '../middlewares/auth';

const router = routerx();
//carga solamente los nombres de la tabla ciudades estados
router.get('/load_excel_city_names_part_1', auth.verifyToken, CiudadesEstadosController.LoadExcelCityNamesPart1);
router.get('/load_excel_city_names_part_2', auth.verifyToken, CiudadesEstadosController.LoadExcelCityNamesPart2);

//Cargar ciudades y estados de excel en public/codigosPostales/...
router.get('/load_excel_city_cp_part1', auth.verifyToken, CiudadesEstadosController.LoadExcelCityCp_Part1);
router.get('/load_excel_city_cp_part2', auth.verifyToken, CiudadesEstadosController.LoadExcelCityCp_Part2);

//Listado de Ciudades Estados
router.post('/list_by_estado', CiudadesEstadosController.getListByEstado);

//Listado de Ciudades Estados
router.post('/list_cps_by_ciudad', auth.verifyToken, CiudadesEstadosController.getListCpsByCiudad);

//Listado de Ciudades Estados
router.post('/list_cps_by_ciudad_city_names', auth.verifyToken, CiudadesEstadosController.getListByEstadoJustCityNames);

//Listado de Ciudades Estados
router.get('/info_by_cp/:citycp_cp', auth.verifyToken, CiudadesEstadosController.getInfoByCp);

//Crear Ciudades Estados
router.post('/add', auth.verifyToken, CiudadesEstadosController.createCiudadEstado);

//Crear Ciudades Estados
router.post('/add_sn_token', auth.verifyTokenSocioNegocio, CiudadesEstadosController.createCiudadEstado);

//Actualizamos Ciudades Estados
router.put('/update', auth.verifyToken, CiudadesEstadosController.updateCiudadEstado);

//Actualizamos Ciudades Estados
router.put('/update_sn_token', auth.verifyTokenSocioNegocio, CiudadesEstadosController.updateCiudadEstado);

//Eliminamos Ciudades Estados
router.delete('/delete', auth.verifyToken, CiudadesEstadosController.deleteCiudadEstado);

export default router;