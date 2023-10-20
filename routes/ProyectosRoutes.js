import routerx from 'express-promise-router';
import auth from '../middlewares/auth';
import ProyectosController from '../controllers/ProyectosController';

const router = routerx();

router.get('/listaproyectos', // auth.verifyToken,
    ProyectosController.getAllProyectos);

router.get('/listaproyectossocionegocio', // auth.verifyToken,
    ProyectosController.getListProyectos);

router.get('/listaproductosproyecto', // auth.verifyToken,
    ProyectosController.getListProductosProyecto);

export default router;
