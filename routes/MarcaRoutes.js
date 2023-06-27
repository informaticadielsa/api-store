import routerx from 'express-promise-router';
import marcasController from '../controllers/MarcasController';
import auth from '../middlewares/auth';

const router = routerx();
//Crear marca
router.post('/add', auth.verifyToken, marcasController.createMarca);
//Actualizamos  marca
router.put('/update', auth.verifyToken, marcasController.updateMarca);
//Detalle marca
router.get('/marca/:id', auth.verifyToken, marcasController.getMarcaById);
//Listado marcas
router.get('/list', auth.verifyToken, marcasController.getListadoMarcas);
//Listado marcas sin token
router.get('/list_sn_token', marcasController.getListadoMarcas);

//Eliminamos una marca
router.delete('/delete', auth.verifyToken, marcasController.deleteMarca);
export default router;