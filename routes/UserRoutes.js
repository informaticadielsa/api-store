import routerx from 'express-promise-router';
import userController from '../controllers/UserController';
import auth from '../middlewares/auth';

const router = routerx();
//Login
router.post('/login', userController.loginUsuario);
//Listado de susuarios
router.get('/list/:idUsuario?', auth.verifyToken, userController.getlistUsuarios);
//Usuario By Id
router.get('/:id', auth.verifyToken, userController.getUsuarioId);
//Eliminar usuario
router.delete('/delete', auth.verifyToken, userController.deleteUsuarioById);
//Crear usuario
router.post('/add', auth.verifyToken, userController.addNuevoUsuario);
//Actualizar usuario
router.put('/update', auth.verifyToken, userController.updateUsuarioById);
//Solicitud de recuperación contraseña
router.post('/recovery', userController.recoveryPassword);
//Recuperación de contraseña
router.put('/valid_recovery',  auth.verifyTokenRecovery, userController.validRecovery);
//Usuarios socios de negocio, por gerentes
router.get('/socios_de_negocio/:id', auth.verifyToken, userController.sociosDeNegociosListByUsuario);
//Asignar socio de negocio, a usuario vendedor
router.post('/asignar_socio', auth.verifyToken, userController.asignarSocioNegocio);
//Asignar socio de negocio, a usuario vendedor
router.delete('/asignar_socio', auth.verifyToken, userController.eliminarAsignarSocioNegocio);
//Socios de negocios no relacionados
router.get('/list_relacion_socios/:id', auth.verifyToken, userController.usuariosNoRelacionados);
//Socios de negocios no relacionados by Henry (ajuste)
router.get('/ListaNoRelacionesSN/:id', auth.verifyToken, userController.ListaNoRelacionesSN);
//Eliminar asignacion de gerentes
router.delete('/delete_asignacion_gerente', auth.verifyToken, userController.eliminarSocioNegocioGerente);
//Reasignación vendedores
router.post('/reasignacion_vendedor', auth.verifyToken, userController.reasignarVendedorToGerente);
//Reasignar socio to gerente
router.post('/reasignacion_gerente', auth.verifyToken, userController.changeSocioToGerente);
//Get Only Gerentes 
router.get('/list_gerente/:id', auth.verifyToken, userController.getListaGerentes);
export default router;