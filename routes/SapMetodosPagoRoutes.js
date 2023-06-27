import routerx from 'express-promise-router';
import sapMetodosPagoController from '../controllers/SapMetodosPagoController';
import auth from '../middlewares/auth';

const router = routerx();
//Crear marca
// router.post('/add', auth.verifyToken, marcasController.createMarca);

// //Actualizamos  marca
// router.put('/update', auth.verifyToken, marcasController.updateMarca);

// //Detalle marca
// router.get('/marca/:id', auth.verifyToken, marcasController.getMarcaById);

//Listado marcas
router.get('/list', sapMetodosPagoController.getListadoSapMetodosPago);

// //Eliminamos una marca
// router.delete('/delete', auth.verifyToken, marcasController.deleteMarca);

export default router;