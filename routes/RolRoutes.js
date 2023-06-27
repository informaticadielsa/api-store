import routerx from 'express-promise-router';
import rolController from '../controllers/RolController';
import auth from '../middlewares/auth';

const router = routerx();
//Listado Roles
router.get('/list', auth.verifyToken, rolController.getRoles);
//listado roles socios de negocio
router.get('/list_socio_negocio', auth.verifyToken, rolController.getRolesSocioNegocio); //  55
//listado de roles vendedores
router.get('/list_vendedores', auth.verifyToken, rolController.getRolesVendedores); //56
//Get Rol By Id
router.get('/:id', auth.verifyToken, rolController.getRolById);
//Creación de rol
router.post('/add', auth.verifyToken, rolController.createRol);
//Actualizar nombre y descripción de rol
router.put('/update', auth.verifyToken, rolController.updateRol);
//Actualizar Permisos
router.put('/updateRolPermiso', auth.verifyToken, rolController.updatePermisosRoles);
export default router;