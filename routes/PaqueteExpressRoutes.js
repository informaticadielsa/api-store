import routerx from 'express-promise-router';
import PaqueteExpressController from '../controllers/PaqueteExpressController';
import auth from '../middlewares/auth';

const router = routerx();
//Crear Cotizacion
router.post('/cotizar_carrito', PaqueteExpressController.CotizarCarrito);


// //Actualizamos  marca
// router.put('/update', auth.verifyToken, PaqueteExpressController.updateMarca);
// //Detalle marca
// router.get('/marca/:id', auth.verifyToken, PaqueteExpressController.getMarcaById);
// //Listado marcas
// router.get('/list', auth.verifyToken, PaqueteExpressController.getListadoMarcas);
// //Listado marcas sin token
// router.get('/list_sn_token', PaqueteExpressController.getListadoMarcas);

// //Eliminamos una marca
// router.delete('/delete', auth.verifyToken, PaqueteExpressController.deleteMarca);
export default router;