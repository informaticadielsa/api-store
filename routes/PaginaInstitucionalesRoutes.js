import routerx from 'express-promise-router';
import paginaInstitucionalController from '../controllers/PaginaInstitucionalController';
import auth from '../middlewares/auth';


const router = routerx();
//Crear pagina institucional
router.post('/add', auth.verifyToken, paginaInstitucionalController.createPaginaInstituciona);
//Actualizamos la pagina institucional
router.put('/update', auth.verifyToken, paginaInstitucionalController.updatePaginaInstitucional);
//Eliminamos la pagina institucional
router.delete('/delete', auth.verifyToken, paginaInstitucionalController.deletePaginaInstitucional);
//Get detalle pagina para administrador
router.get('/pagina/:id', auth.verifyToken, paginaInstitucionalController.getDetalleForAdmin);
//listado para admin
router.get('/list_admin', auth.verifyToken, paginaInstitucionalController.getListadoForAdmin);
//Get detalle pagina  para uso publico
router.get('/pagina/public/:id', paginaInstitucionalController.getDetallePublic);
//Listado public
router.get('/list_public', paginaInstitucionalController.getListadoPublic);
export default router;