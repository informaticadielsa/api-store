import routerx from 'express-promise-router';
import faqsController from '../controllers/FaqsController';
import auth from '../middlewares/auth';

const router = routerx();
//Crear faqs
router.post('/add', auth.verifyToken, faqsController.createFaqs);


//Actualizamos  faqs
router.put('/update', auth.verifyToken, faqsController.updateFaqs);


//Identificador faqs
router.post('/getByIdentificador/', faqsController.getByIdentificador);

//Identificador faqs
router.get('/getAllIdentificador/', faqsController.getAllIdentificador);


//Listado faqs
router.get('/list', faqsController.getListadoFaqs);

//Eliminamos una faqs
router.delete('/delete', auth.verifyToken, faqsController.deleteFaqs);


export default router;

