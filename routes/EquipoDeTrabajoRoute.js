import routerx from 'express-promise-router';
import equipoDeTrabajoController from '../controllers/EquipoDeTrabajoController';
import auth from '../middlewares/auth';

const router = routerx();
//Crear equipo de trabajo
router.post('/add', auth.verifyToken, equipoDeTrabajoController.createEquipoDeTrabajo);
//Traemos lista de equipo de trabajo
router.get('/lista/:idUsuario', auth.verifyToken, equipoDeTrabajoController.getlistEquiposDeTrabajo);
//Detalle equipo de trabajo
router.get('/equipoById/:idEquipoTrabajo', auth.verifyToken, equipoDeTrabajoController.getEquipoDeTrabajoById);
//Actualizar equipo de trabajo
router.put('/update', auth.verifyToken, equipoDeTrabajoController.updateEquipoDeTrabajo);
//Eliminamos equipo de trabjo
router.delete('/delete', auth.verifyToken, equipoDeTrabajoController.deleteEquipoDeTrabajo);
export default router;