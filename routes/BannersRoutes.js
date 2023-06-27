import routerx from 'express-promise-router';
import bannersController from '../controllers/BannersController';
import auth from '../middlewares/auth';


const router = routerx();

//Crear faqs
router.post('/add', auth.verifyToken, bannersController.createBanners);


//Actualizamos  faqs
router.put('/update', auth.verifyToken, bannersController.updateBanners);

// //Identificador faqs
// router.post('/getByIdentificador/', auth.verifyToken, bannersController.getByIdentificador);

// //Identificador faqs
// router.get('/getAllIdentificador/', auth.verifyToken, bannersController.getAllIdentificador);


//Listado faqs
router.get('/list', auth.verifyToken, bannersController.getListBanners);

//Eliminamos una faqs
router.delete('/delete', auth.verifyToken, bannersController.deleteBanners);


export default router;