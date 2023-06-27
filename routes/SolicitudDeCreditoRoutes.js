import routerx from 'express-promise-router';
import solicitudDeCreditoController from '../controllers/SolicitudDeCreditoController';
import auth from '../middlewares/auth';

const router = routerx();

//Listado socio negocios
router.post('/create', auth.verifyTokenSocioNegocio, solicitudDeCreditoController.crearSolicitudDeCredito);

//GetSolicitud de credito
router.get('/solicitud/:id', auth.verifyToken, solicitudDeCreditoController.getSolicitudDeCreditoById);
export default router;