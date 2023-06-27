import routerx from 'express-promise-router';
import ProductosKitsComponentesController from '../controllers/ProductosKitsComponentesController';
import auth from '../middlewares/auth';

const router = routerx();
// Crear kit
router.post('/add', auth.verifyToken, ProductosKitsComponentesController.createProductosKitComponente);

//Actualizamos kits
// router.put('/update', auth.verifyToken, ProductosKitsComponentesController.updateProductosKit);

// // //Listado kits
// router.get('/list', auth.verifyToken, ProductosKitsComponentesController.getListadoProductosKit);

// // //Eliminamos un ki
router.delete('/delete', auth.verifyToken, ProductosKitsComponentesController.deleteProductosKitComponente);



export default router;