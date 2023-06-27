import routerx from 'express-promise-router';
import CfdiController from '../controllers/CfdiController';


const router = routerx();

//Socios Negocios Integracion
router.get('/listCFDI',  CfdiController.getList);

export default router;