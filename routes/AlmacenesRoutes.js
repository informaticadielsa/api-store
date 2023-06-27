import routerx from 'express-promise-router';
import almacenesController from '../controllers/AlmacenesController';
import auth from '../middlewares/auth';

const router = routerx();
//Creamos coleccion
router.post('/add', auth.verifyToken, almacenesController.createAlmacenes);
router.get('/list', auth.verifyToken, almacenesController.getListAlmacenes);
router.get('/list/:id', auth.verifyToken, almacenesController.getAlmacenesId);
router.put('/update_almacenes', auth.verifyToken, almacenesController.updateAlmacenes);
router.delete('/delete_almacenes', auth.verifyToken, almacenesController.deleteAlmacenes);


router.get('/get_almacenes_recoleccion', almacenesController.getAlmacenesPickUp);

//Sin token, b2b
router.get('/list_public', almacenesController.getListAlmacenesPublic);

export default router;