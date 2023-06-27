import routerx from 'express-promise-router';
import cotizacionProyectoController from '../controllers/CotizacionProyectoController';
import auth from '../middlewares/auth';

const router = routerx();
//Restructuración proyectos y cotizaciones 
router.post('/generate', auth.verifyToken, cotizacionProyectoController.generateCotizacionProyect);
router.post('/generate_public', auth.verifyTokenSocioNegocio, cotizacionProyectoController.generateCotizacionProyect);
//Actualiza datos de proyecto y cotizaciones
router.put('/update_cp', auth.verifyToken, cotizacionProyectoController.editUpdateCotizacion);
//Pasamos nuestra cotizacion al carrito
router.post('/to_car_shop', auth.verifyToken, cotizacionProyectoController.pasarProyectoCarrito);
//Pasamos nuestra cotizacion al carrito
router.post('/to_car_shop_sn', auth.verifyTokenSocioNegocio, cotizacionProyectoController.pasarProyectoCarrito);
//Eliminar cotización
router.delete('/delete', auth.verifyToken, cotizacionProyectoController.deleteCotizacionProyecto);
//Eliminar cotización
router.delete('/delete_sn', auth.verifyTokenSocioNegocio, cotizacionProyectoController.deleteCotizacionProyecto);



//Create Cotización
router.post('/create', auth.verifyToken, cotizacionProyectoController.createCotizacionProyecto);
//Aceptar o rechazar producto, cotización
router.post('/producto', auth.verifyToken, cotizacionProyectoController.aceptProductoCotizacion);
//Get cotizaciones
router.get('/cotizaciones_proyectos/:id', auth.verifyToken, cotizacionProyectoController.getCotizacionByIdUsuario);
//Get by Socio de negocio
router.get('/cotizaciones_proyectos_by_socio/:id', auth.verifyTokenSocioNegocio, cotizacionProyectoController.getCotizacionByIdSocioNegocio);
//Admin
router.get('/cotizaciones_proyectos_by_socio_by_admin/:id', auth.verifyToken, cotizacionProyectoController.getCotizacionByIdSocioNegocioAdmin);
//Get detalle cotización 
router.get('/cotizacion_by_id/:id', auth.verifyToken, cotizacionProyectoController.getCotizacionProyectoById);
//Get detalle cotización (GET SOCIO NEGOCIO)
router.get('/cotizacion_by_id_socio/:id', auth.verifyTokenSocioNegocio, cotizacionProyectoController.getCotizacionProyectoById);
//Actualizamos el estatus de una cotización o proyecto (nombre)
router.put('/update', auth.verifyToken, cotizacionProyectoController.updateCotizacionProyecto);
//Enviar cotizacion cliente
router.post('/send_cotizacion', auth.verifyToken, cotizacionProyectoController.sendCotizacionToCliente);
export default router;