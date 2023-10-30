import routerx from 'express-promise-router';
import auth from '../middlewares/auth';
import ProyectosController from '../controllers/ProyectosController';

const router = routerx();

router.post('/listaproyectos', // auth.verifyToken,
    ProyectosController.getAllProyectos);

router.post('/listaproyectossocionegocio', // auth.verifyToken,
    ProyectosController.getListProyectos);

router.post('/listaproductosproyecto', // auth.verifyToken,
    ProyectosController.getListProductosProyecto);

router.post('/nuevoproyecto', // auth.verifyToken,
    ProyectosController.newProyecto);

router.post('/obtenerprecioproductoproyecto', // auth.verifyToken,
    ProyectosController.getPriceProductProyecto);

export default router;
