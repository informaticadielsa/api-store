import routerx from 'express-promise-router';
import contactoController from '../controllers/ContactoController';
const router = routerx();
router.post('/send', contactoController.contactoSendEmail);
export default router;