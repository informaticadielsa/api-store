import routerx from 'express-promise-router';
import listaPreciosController from '../controllers/ListaPreciosController';
import auth from '../middlewares/auth';

const router = routerx();

//Crear lista de precios
router.post('/add', auth.verifyToken, listaPreciosController.createdListaPrecio);

//Get Lista de precio
router.get('/lista/:id', auth.verifyToken, listaPreciosController.getListaDePreciosId);

//Get productos paginados
router.post('/productos_hijos', auth.verifyToken, listaPreciosController.getProductosListaDePrecioPaginados);

//update producto 
router.put('/update', auth.verifyToken, listaPreciosController.updateListaDePrecio);

//Update precio 
router.put('/update_precio', auth.verifyToken, listaPreciosController.updatePrecioLista);

//Get listas de preico
router.get('/list', auth.verifyToken, listaPreciosController.getListasDePrecios);

//Eliminamos lista de preico
router.delete('/delete', auth.verifyToken, listaPreciosController.deleteListaPrecio);



export default router;