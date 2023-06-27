import routerx from 'express-promise-router';
import slidersController from '../controllers/SlidersController';
import auth from '../middlewares/auth';


const router = routerx();

//Crear slider
router.post('/add', auth.verifyToken, slidersController.createSliders);


//Actualizamos  slider
router.put('/update', auth.verifyToken, slidersController.updateSliders);

// //Identificador slider
// router.post('/getByIdentificador/', auth.verifyToken, slidersController.getByIdentificador);

// //Identificador slider
// router.get('/getAllIdentificador/', auth.verifyToken, slidersController.getAllIdentificador);


//Listado slider
router.get('/list', auth.verifyToken, slidersController.getListSliders);

//Eliminamos una slider
router.delete('/delete', auth.verifyToken, slidersController.deleteBanners);


export default router;