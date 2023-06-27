import routerx from 'express-promise-router';
import promocionesController from '../controllers/PromocionesController';
import auth from '../middlewares/auth';

const router = routerx();
router.post('/add', auth.verifyToken, promocionesController.createPromotion);
router.put('/update', auth.verifyToken, promocionesController.updatePromotion);
router.delete('/delete', auth.verifyToken, promocionesController.deletePromotion);
router.post('/articulos_promocion', auth.verifyToken, promocionesController.getArticulosPromociones);
router.get('/list', auth.verifyToken, promocionesController.getListPromotios);
router.get('/promocion/:id', auth.verifyToken, promocionesController.getPromocionById);
export default router;