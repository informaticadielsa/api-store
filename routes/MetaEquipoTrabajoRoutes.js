import routerx from 'express-promise-router';
import metaEquipoTrabajoController from '../controllers/MetaEquipoTrabajoController';
import auth from '../middlewares/auth';

const router = routerx();
router.put('/update', auth.verifyToken, metaEquipoTrabajoController.updateMetaEquipoTrabajo);
router.get('/meta/:id', auth.verifyToken, metaEquipoTrabajoController.getDetalleMeta);
export default router;