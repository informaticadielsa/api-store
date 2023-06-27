import routerx from 'express-promise-router';
import productosKitsController from '../controllers/ProductosKitsController';
import auth from '../middlewares/auth';

const router = routerx();
// Crear kit
router.post('/add', auth.verifyToken, productosKitsController.createProductosKit);
// //Actualizamos kits
router.put('/update', auth.verifyToken, productosKitsController.updateProductosKit);
// //Detalle kits
// router.get('/marca/:id', auth.verifyToken, productosKitsController.getMarcaById);
// //Listado kits
router.get('/list', auth.verifyToken, productosKitsController.getListadoProductosKit);
// //Eliminamos un ki
router.delete('/delete', auth.verifyToken, productosKitsController.deleteProductosKit);



export default router;