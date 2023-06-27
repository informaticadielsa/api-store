import routerx from 'express-promise-router';
import sociosNegocioController from '../controllers/SociosNegocioController';
import auth from '../middlewares/auth';

const router = routerx();

//Listado socio negocios
router.get('/list', auth.verifyToken, sociosNegocioController.getListSociosNegocio);

// //Detalle SN
router.get('/list/:id', auth.verifyToken, sociosNegocioController.getListSociosNegocioByID);

//Crear SN
router.post('/add', auth.verifyToken, sociosNegocioController.createSociosNegocio);


//Crear SN B2B
router.post('/new_socio_negocio', sociosNegocioController.createOfProfileInB2B);

//Actualizamos  SN
router.put('/update', auth.verifyToken, sociosNegocioController.updateSociosNegocio);

//Eliminamos una marca
router.delete('/delete', auth.verifyToken, sociosNegocioController.deleteSociosNegocio);

//Listado socio negocios Paginado
router.post('/listPaginada', auth.verifyToken, sociosNegocioController.getListSociosNegocioPaginada);

//Listado socio negocios Paginado
router.post('/getListSociosNegocioPaginadaByCardCode', auth.verifyToken, sociosNegocioController.getListSociosNegocioPaginadaByCardCode);

//Listado socio negocios Paginado
router.post('/getListSociosNegocioPaginadaByVendedor', auth.verifyToken, sociosNegocioController.getListSociosNegocioPaginadaByVendedor);




//APIS de token SN

//Actualizacion sn con token de SN
router.put('/update_sn_token', auth.verifyTokenSocioNegocio, sociosNegocioController.updateSociosNegocioSNToken);
router.get('/getListSociosNegocioByID_SN_TOKEN/:id', auth.verifyTokenSocioNegocio, sociosNegocioController.getListSociosNegocioByID_SN_TOKEN);



export default router;