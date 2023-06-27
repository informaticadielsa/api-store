import routerx from 'express-promise-router';
import sapFormasPagoController from '../controllers/SapFormasPagoController';
import auth from '../middlewares/auth';

const router = routerx();
//Crear marca
// router.post('/add', auth.verifyToken, marcasController.createMarca);

//Actualizamos  marca
router.put('/update', auth.verifyToken, sapFormasPagoController.updateSapFormasPago);

// //Detalle marca
// router.get('/marca/:id', auth.verifyToken, marcasController.getMarcaById);

//Listado marcas
router.get('/list', sapFormasPagoController.getListadoSapFormasPago);

// //Eliminamos una marca
// router.delete('/delete', auth.verifyToken, marcasController.deleteMarca);

export default router;