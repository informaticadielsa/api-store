import routerx from 'express-promise-router';
import V2PromocionesController from '../controllers/V2PromocionesController';
import auth from '../middlewares/auth';

const router = routerx();

//Obtener elementos para guardar promociones
router.post('/get_product_for_promotions', V2PromocionesController.getProductForPromotions);

//Crear promocion
router.post('/create_promocion', V2PromocionesController.createPromocion);

//delete promocion
router.post('/delete_promocion', V2PromocionesController.deletePromocion);

//get promocion
router.get('/get_promocion/:id_promocion', V2PromocionesController.getPromocion);

//update promocion
router.post('/update_Promocion', V2PromocionesController.updatePromocion);

//get list promocion
router.get('/get_lista_promociones', V2PromocionesController.getListPromociones);


export default router;