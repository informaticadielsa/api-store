import routerx from 'express-promise-router';
import PoliticasEnvioController from '../controllers/PoliticasEnvioController.js';
import auth from '../middlewares/auth';

const router = routerx();

//carga solamente los nombres de la tabla ciudades estados
router.post('/create', auth.verifyToken, PoliticasEnvioController.CreateShippingPolicies);

//carga solamente los nombres de la tabla ciudades estados
router.get('/get_detail/:poe_politicas_envio_id', auth.verifyToken, PoliticasEnvioController.getShippingPoliciesDetail);

//carga solamente los nombres de la tabla ciudades estados
router.get('/get_list', auth.verifyToken, PoliticasEnvioController.getShippingPoliciesList);

//carga solamente los nombres de la tabla ciudades estados
router.put('/update', auth.verifyToken, PoliticasEnvioController.UpdateShippingPolicies);

//carga solamente los nombres de la tabla ciudades estados
router.put('/update_status', auth.verifyToken, PoliticasEnvioController.UpdateShippingPoliciesStatus);

//carga solamente los nombres de la tabla ciudades estados
router.delete('/delete', auth.verifyToken, PoliticasEnvioController.DeleteShippingPolicies);

export default router;