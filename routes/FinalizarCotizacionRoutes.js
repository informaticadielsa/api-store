import routerx from 'express-promise-router';
import finalizarCotizacion from '../controllers/FinalizarCotizacionController';
import auth from '../middlewares/auth';

const router = routerx();
//Creamos coleccion
router.post('/finish-quotes-cart', finalizarCotizacion.finishQuotesCart);
//router.get('/list', auth.verifyToken, almacenesController.getListAlmacenes);

export default router;