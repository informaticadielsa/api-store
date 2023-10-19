import routerx from 'express-promise-router';
import auth from '../middlewares/auth';
import ProyectosController from '../controllers/ProyectosController';

const router = routerx();

router.get('/listaProyecto', // auth.verifyToken,
    ProyectosController.getListProyectos);

export default router;
