import routerx from 'express-promise-router';
import facturasController from '../controllers/FacturasController';
import auth from '../middlewares/auth';

const router = routerx();

//Listado de facturas
router.get('/list', auth.verifyToken, facturasController.getListFacturas);

//Detalle SN
router.post('/getListByIDUsuario', auth.verifyToken, facturasController.getListByIDUsuario);

//Detalle SN
router.post('/getListByCardCode', auth.verifyToken, facturasController.getListByCardCode);


//Detalle SN
router.post('/getListByCardCode_SNToken', auth.verifyTokenSocioNegocio, facturasController.getListByCardCode_SnToken);




export default router;