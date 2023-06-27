import routerx from 'express-promise-router';
import sociosNegocioUsuariosController from '../controllers/SociosNegocioUsuariosController';
import auth from '../middlewares/auth';

const router = routerx();

//Listado socio negocios
router.get('/list', auth.verifyToken, sociosNegocioUsuariosController.getListSociosNegocioUsuarios);

// //Detalle SN
router.get('/list/:id', auth.verifyToken, sociosNegocioUsuariosController.getListSociosNegocioUsuarioByID);

//Crear SN
router.post('/getByCardCode', auth.verifyToken, sociosNegocioUsuariosController.getListSociosNegocioUsuarioByCardCode);

//Crear SN
router.post('/add', auth.verifyToken, sociosNegocioUsuariosController.createSociosNegocioUsuario);
//Lista de usaurios 
router.get('/list_usuario_SN', auth.verifyTokenSocioNegocio, sociosNegocioUsuariosController.getListSociosNegocioUsuarios);

//Actualizamos  SN
router.put('/update', auth.verifyToken, sociosNegocioUsuariosController.updateSociosNegocioUsuario);

//Eliminamos una Ususario SN
router.delete('/delete', auth.verifyToken, sociosNegocioUsuariosController.deleteSociosNegocioUsuarios);

//Acceso a usuario socio de negocio
router.post('/login', sociosNegocioUsuariosController.loginUsuarioSocioNegocio);

//Recuperar contrasena
router.post('/recovery', sociosNegocioUsuariosController.recoveryPassword);
router.put('/valid_recovery',  auth.verifyTokenRecovery, sociosNegocioUsuariosController.validRecovery);

//SOCIO NEGOCIO
router.post('/add_SN', auth.verifyTokenSocioNegocio, sociosNegocioUsuariosController.createSociosNegocioUsuario);
router.get('/list_usuarios_SN/:id', auth.verifyTokenSocioNegocio, sociosNegocioUsuariosController.getListUsuariosSociosNegocio);



//Actualizamos  SN con token de SN
router.put('/update_SN_token', auth.verifyTokenSocioNegocio, sociosNegocioUsuariosController.updateSociosNegocioUsuario_SN_token);
router.get('/list_SN_token/:id', auth.verifyTokenSocioNegocio, sociosNegocioUsuariosController.getListSociosNegocioUsuarioByID);
router.post('/add_SN_token', auth.verifyToken, sociosNegocioUsuariosController.createSociosNegocioUsuario);
router.post('/getByCardCode_SN_token', auth.verifyToken, sociosNegocioUsuariosController.getListSociosNegocioUsuarioByCardCode);
router.get('/list_SN_token', auth.verifyToken, sociosNegocioUsuariosController.getListSociosNegocioUsuarios);


//Actualizamos  SN con token de SN
router.put('/ChangePassword', auth.verifyTokenSocioNegocio, sociosNegocioUsuariosController.ChangePassword);




// Sn by id front
router.get('/get_snu_by_id/:id', auth.verifyTokenSocioNegocio, sociosNegocioUsuariosController.getSociosNegocioUsuariosById);





export default router;