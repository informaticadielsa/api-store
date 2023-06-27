import routerx from 'express-promise-router';
import CompraFinalizadaController  from '../controllers/CompraFinalizadaController';
import auth from '../middlewares/auth';


const router = routerx();
//Crear equipo de trabajo
router.post('/add', auth.verifyToken, CompraFinalizadaController.finalizarCompra);
//Crear equipo de trabajo
router.post('/add_socio', auth.verifyTokenSocioNegocio, CompraFinalizadaController.finalizarCompra);
//Historial de socio de negocio
router.get('/list/:idSocio', auth.verifyToken, CompraFinalizadaController.getHistorialSocioNegocio);
//Get lista por socio 
router.get('/list_by_user/:idUsuario', auth.verifyToken, CompraFinalizadaController.getListForUser);
//Detalle de orden
router.get('/detalle/:idCompra', auth.verifyToken, CompraFinalizadaController.getOnlyByID);
//Detalle de orden socio negocio
router.get('/detalle_socio/:idCompra', auth.verifyTokenSocioNegocio, CompraFinalizadaController.getOnlyByID);
//Get By Product Ordenes
router.post('/GetBySkuNombre', auth.verifyToken, CompraFinalizadaController.GetBySkuNombre);
//Get By Estado
router.post('/GetByEstado', auth.verifyToken, CompraFinalizadaController.GetByEstado);






//get historial by cardcode
router.post('/getHistorialPedidosByCardCode', auth.verifyTokenSocioNegocio, CompraFinalizadaController.getHistorialPedidosByCardCode);

router.put('/updateStatusPedido', auth.verifyTokenSocioNegocio, CompraFinalizadaController.updateStatusPedido);




//Detalle de orden
router.get('/detalle_snToken/:idCompra', auth.verifyTokenSocioNegocio, CompraFinalizadaController.getOnlyByID);


//Detalle de orden
router.post('/v2_compra_finalizada', CompraFinalizadaController.V2finalizarCompra);




//Detalle de orden
router.get('/get_ordenes_fallidas',  auth.verifyToken, CompraFinalizadaController.getOrdenesFallidasToSap);

//Detalle de orden
router.get('/get_ordenes_fallidasV2',  auth.verifyToken, CompraFinalizadaController.getOrdenesFallidasToSapV2);




//Detalle de orden
router.post('/update_ordenes_fallidasV2',  auth.verifyToken, CompraFinalizadaController.updateOrdenesFallidasToSapV2);
//Delete Historial
router.delete('/delete_ordenes_fallidasV2',  auth.verifyToken, CompraFinalizadaController.deleteOrdenesFallidasToSapV2);
//Solucionado Historial
router.put('/solucionado_ordenes_fallidasV2',  auth.verifyToken, CompraFinalizadaController.solucionadoOrdenesFallidasToSapV2);









//Detalle de orden
// router.post('/v3_compra_finalizada', CompraFinalizadaController.V3finalizarCompra);



//Listado de ordenes de un socio de negocio por token Admin
router.get('/list_sn/:idSocio', auth.verifyToken, CompraFinalizadaController.getHistorialSocioNegocioTokenSN);
//Listado de ordenes de un socio de negocio por token SN
router.get('/list_sn_token/:idSocio', auth.verifyTokenSocioNegocio, CompraFinalizadaController.getHistorialSocioNegocioTokenSN);


//Detalle de una orden por su numero de orden con token admin
router.get('/getPedidoDetalleByIDAdmin/:id_pedido', auth.verifyToken, CompraFinalizadaController.getPedidoDetalleByID);
//Detalle de una orden por su numero de orden con token SN
router.get('/getPedidoDetalleByID/:id_pedido', auth.verifyTokenSocioNegocio, CompraFinalizadaController.getPedidoDetalleByID);



export default router;