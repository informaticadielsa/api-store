import routerx from 'express-promise-router';
import newsletterController from '../controllers/NewsletterController';
import auth from '../middlewares/auth';

const router = routerx();


router.post('/add', newsletterController.createNewsletter);
router.get('/list', auth.verifyToken, newsletterController.getListNewsletter);

export default router;