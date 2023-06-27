import routerx from 'express-promise-router';
import controlesMaestrosController from '../controllers/ControlesMaestrosMultiplesController';
import auth from '../middlewares/auth';

const router = routerx();
router.get('/control/:name', auth.verifyToken, controlesMaestrosController.getListByName);
router.get('/control_public/:name', controlesMaestrosController.getListByName);
router.post('/controlUpdate/', auth.verifyToken, controlesMaestrosController.update);


router.get('/get_front_URL', controlesMaestrosController.getFrontURL);
export default router;