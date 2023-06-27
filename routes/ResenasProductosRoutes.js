import routerx from 'express-promise-router';
import ResenasProductosController from '../controllers/ResenasProductosController';
import auth from '../middlewares/auth';

const router = routerx();

//Listado de Fletera
router.get('/list/:id', ResenasProductosController.getListResenasProductosByIDProducto);

//Crear Fletera
router.post('/add', auth.verifyTokenSocioNegocio, ResenasProductosController.createResenasProductos);

// Actualizamos  fleteras
router.put('/aprobar_resena', auth.verifyToken, ResenasProductosController.AprobarResenasProductos);

// Actualizamos  fleteras
router.put('/NO_aprobar_resena', auth.verifyToken, ResenasProductosController.NOAprobarResenasProductos);



//Listado de reseñas no aprobadas
router.get('/getListResenasNoAprobadas', auth.verifyToken, ResenasProductosController.getListResenasNoAprobadas);

//Listado de Reseñas
router.get('/list', auth.verifyToken, ResenasProductosController.getListResenas);


// //Eliminamos una fletera
// router.delete('/delete', auth.verifyToken, fleterasController.deleteFleteras);



export default router;