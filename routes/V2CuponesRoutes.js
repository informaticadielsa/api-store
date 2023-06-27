import routerx from 'express-promise-router';
import V2CuponesController from '../controllers/V2CuponesController';
import auth from '../middlewares/auth';

const router = routerx();

// //Obtener elementos para guardar promociones
// router.post('/get_product_for_promotions', V2CuponesController.getProductForPromotions);

//Crear cupones
router.post('/create_cupon', V2CuponesController.createCupon);

//delete cupon
router.post('/delete_cupon', V2CuponesController.deleteCupon);

//delete cupon
router.get('/get_cupon/:id_promocion', V2CuponesController.getCupon);

//delete cupon
router.post('/update_cupon', V2CuponesController.updateCupon);

//get list cupones
router.get('/get_lista_cupones', V2CuponesController.getListCupones);

//update status cupon
router.post('/update_cupon_status', V2CuponesController.updateCuponStatus);


export default router;