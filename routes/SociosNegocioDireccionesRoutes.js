import routerx from 'express-promise-router';
import sociosNegocioDireccionesController from '../controllers/SociosNegocioDireccionesController';
import auth from '../middlewares/auth';

const router = routerx();

//Listado socio negocios
router.get('/list', auth.verifyToken, sociosNegocioDireccionesController.getListSociosNegocioDirecciones);

// //Detalle SN
router.get('/list/:id', auth.verifyToken, sociosNegocioDireccionesController.getListSociosNegocioDireccionesByID);

//gET BY cardcode
router.post('/getByCardCode', auth.verifyToken, sociosNegocioDireccionesController.getListSociosNegocioDireccionesByCardCode);

//Crear SN
router.post('/add', auth.verifyToken, sociosNegocioDireccionesController.createSociosNegocioDirecciones);

//Actualizamos  SN
router.put('/update', auth.verifyToken, sociosNegocioDireccionesController.updateSociosNegocioDirecciones);

//Eliminamos una Ususario SN
router.delete('/delete', auth.verifyToken, sociosNegocioDireccionesController.deleteSociosNegocioDirecciones);





//Actualizamos  SN
router.put('/update_snd_ST', auth.verifyTokenSocioNegocio, sociosNegocioDireccionesController.updateSociosNegocioDirecciones);

//Listado socio negocios
router.get('/list_snd_ST', auth.verifyTokenSocioNegocio, sociosNegocioDireccionesController.getListSociosNegocioDirecciones);

//Crear SN
router.post('/add_snd_ST', auth.verifyTokenSocioNegocio, sociosNegocioDireccionesController.createSociosNegocioDirecciones);

//Eliminamos una Ususario SN
router.delete('/delete_snd_ST', auth.verifyTokenSocioNegocio, sociosNegocioDireccionesController.deleteSociosNegocioDirecciones);

//gET BY cardcode
router.post('/getByCardCode_snd_ST', auth.verifyTokenSocioNegocio, sociosNegocioDireccionesController.getListSociosNegocioDireccionesByCardCode);

// //Detalle SN
router.get('/list_snd_ST/:id', auth.verifyTokenSocioNegocio, sociosNegocioDireccionesController.getListSociosNegocioDireccionesByID);



export default router;