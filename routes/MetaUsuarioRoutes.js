import routerx from 'express-promise-router';
import metaUsuarioController from '../controllers/MetaUsuarioController';
import auth from '../middlewares/auth';

const router = routerx();
//Actualizamos la meta individual
router.put('/update', auth.verifyToken, metaUsuarioController.updateMetaUsuario);
export default router;