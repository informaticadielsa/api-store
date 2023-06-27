import routerx from 'express-promise-router';
import fleterasController from '../controllers/FleterasController';
import auth from '../middlewares/auth';

const router = routerx();

//Listado de Fletera
router.get('/list', auth.verifyToken, fleterasController.getListFleteras);

//Crear Fletera
router.post('/add', auth.verifyToken, fleterasController.createFletera);

//Actualizamos  fleteras
router.put('/update', auth.verifyToken, fleterasController.updateFleteras);

//Eliminamos una fletera
router.delete('/delete', auth.verifyToken, fleterasController.deleteFleteras);

//Listado de Fletera socionegocio
router.get('/list_socio', auth.verifyTokenSocioNegocio, fleterasController.getListFleterasSN);


//Listado de Fletera socionegocio
router.post('/Cotizar_Carrito_Fleter_Front', auth.verifyTokenSocioNegocio, fleterasController.CotizarCarritoFleteraFront);
router.post('/Cotizar_Carrito_Fleter_Admin', auth.verifyToken, fleterasController.CotizarCarritoFleteraFront);



export default router;