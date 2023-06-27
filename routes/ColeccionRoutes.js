import routerx from 'express-promise-router';
import coleccionController from '../controllers/ColeccionController';
import auth from '../middlewares/auth';

const router = routerx();
//Creamos coleccion
router.post('/add', auth.verifyToken, coleccionController.createColeccion);

//Actualizamos la coleccion
router.put('/update', auth.verifyToken, coleccionController.updateColeccion);

//Actualizamos la coleccion
router.post('/update_producto_coleccion_relacion', auth.verifyToken, coleccionController.updateProductoColeccionRelacion);

//Delete colecccion
router.delete('/delete', auth.verifyToken, coleccionController.deleteColeccion);
//getColección detalle
router.get('/coleccion/:id', auth.verifyToken, coleccionController.getColeccionById);

//getColección detalle
router.get('/coleccion_store/:id', coleccionController.getColeccionById);

//Get LIST Colecciones
router.get('/list', auth.verifyToken, coleccionController.getListColecciones);
//Listado publico 
router.get('/list_public/:tipo', coleccionController.getListadoColeccionesPublica);
export default router;