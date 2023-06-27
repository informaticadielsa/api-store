import routerx from 'express-promise-router';
import UsuariosProspectosController from '../controllers/UsuariosProspectosController';
import auth from '../middlewares/auth';

const router = routerx();
router.post('/add',  UsuariosProspectosController.createProspecto);

router.get('/list', auth.verifyToken, UsuariosProspectosController.getListProspectos);
router.get('/get_detalle/:id', auth.verifyToken, UsuariosProspectosController.getDetalleProspectos);

router.put('/update', auth.verifyToken, UsuariosProspectosController.updateProspectos);

router.delete('/delete', auth.verifyToken, UsuariosProspectosController.deleteProspectos);






export default router;