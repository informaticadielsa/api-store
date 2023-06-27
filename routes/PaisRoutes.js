import routerx from 'express-promise-router';
import paisController from '../controllers/PaisesEstadosController';
import auth from '../middlewares/auth';

const router = routerx();
//Crear equipo de trabajo
router.get('/getListPais', paisController.getListPais);
router.get('/getEstadoByIdPais/:id', paisController.getListEstadoByIdPais);
router.get('/codigoPostales', auth.verifyToken, paisController.codigoPostales);

export default router;