import routerx from 'express-promise-router';
import CotizacionesController from '../controllers/CotizacionesController';
import auth from '../middlewares/auth';

const router = routerx();



//Crear cotizacion a partir de carrito
router.post('/crear_Cotizacion', CotizacionesController.crearCotizacion);
//Crear cotizacion a partir de carrito
router.delete('/cancelar_Cotizacion', CotizacionesController.cancelarCotizacion);
//Crear cotizacion a partir de carrito
router.get('/list', CotizacionesController.getAllCotizaciones);
//Crear cotizacion a partir de carrito
router.get('/list_sn/:id', CotizacionesController.getCotizacionesBySN);
router.post('/quotation_delete', CotizacionesController.quotation_delete);

//Crear cotizacion a partir de carrito V2 con reglas del diagrama (Version del diagrama vieja y toda amontonada)
router.get('/v2_cotizacion_detalle/:id', CotizacionesController.V2getCotizacionesDetalle);
//Actualizar cotizacion
router.put('/update_cotizaciones_linea', CotizacionesController.updateCotizacionesLinea);


//pone el precio de envio de la cot
router.post('/setCotShippingDetail', CotizacionesController.setCotShippingDetail);
//Asignar cfdi a cot
router.post('/asignCotCFDI', CotizacionesController.asignCotCFDI);
//Asignar formaPago a cot
router.post('/setCotTipoCompra', CotizacionesController.setCotTipoCompra);
//Asignar formaPago a cot
router.post('/V2finalizarCompraCot', CotizacionesController.V2finalizarCompraCot);







//V3 19 sep 2022

//Get cotizacion from SNU
router.post('/v3_get_cotizaciones_from_sn', CotizacionesController.V3getCotizacionFromSN);
//Actualizar el total de productos y lineas
router.post('/v3_actualizar_lineas_cantidades_cotizacion', CotizacionesController.V3UpdateLineasCantidadesCotizacion);
//Actualizar linea porcentaje descuento + total + envio total
router.post('/v3_actualizar_lineas_descuentos_vendedores_cotizacion', CotizacionesController.V3UpdateLineasDescuentosVendedoresCotizacion);



//De una cotizacion creada obtener si tiene cambios de precios o productos
router.post('/v3_get_cotizacio_cambios_productos', CotizacionesController.V3GetCotizacionCambiosPrecios);
//Obtener informacion de productos con cambio en stock
router.post('/v3_get_cotizacio_cambios_cantidades_productos', CotizacionesController.V3GetCotizacionCambiosCantidadesProductos);

//Get Cotizaciones totales + 
router.get('/get_totales_cotizaciones_fechas', CotizacionesController.getTotalesCotizacionesPorFechas);
//Cotizar el precio de envio de una cotizacion
router.post('/cotizar_envio_sn_pros', CotizacionesController.cotizarCostoEnvioSNPros);

//Actualizar status cotizacion
router.post('/update_cotizacion_estatus',  CotizacionesController.updateCotizacionEstatus);



//V3 Permitir actualizar precios obtener status
router.get('/v3_permitir_actualizacion_precios', CotizacionesController.V3cotizacionesPermitirActualizarPrecios);





//V3 update linea cantidad
router.post('/v3_update_cotizacion_linea_cantidad', CotizacionesController.V3updateCotizacionLineaCantidad);























//10 Mayo 2023
//v3 cotizaciones
//Cuando un prospecto intente cotizar se obtendra su informacion si ya fue registrada, si no regresara null
router.post('/getProspectoInfo', CotizacionesController.getProspectoInfo);
//Crear prospecto (esta en los usuarios prospectos tabla y modelo)
// http://localhost:5000/api/usuarios_prospectos/add

//Crea solo la direccion de prospecto que se usara para cotizar prospecto
router.post('/add_prospecto_direccion',  CotizacionesController.createProspectoDireccion);

//Crear cotizacion V3 con cliente id null->prospecto o cliente id registrado
router.post('/v3_crear_cotizacion', CotizacionesController.V3crearCotizacion);

// Agrega producto a una cotización
router.post('/addProductToQuotes', CotizacionesController.addProductToQuote);

router.post('/updateProductQuantityOfQuote', CotizacionesController.updateProductQuantityOfQuote);

// Elimina producto de una cotización
router.post('/deleteProductOfQuotes', CotizacionesController.deleteProductOfQuote);

// Actualiza el tipo y dirección de entrega para la cotización
router.post('/updateDeliberyOfQuotes', CotizacionesController.updateDeliberyOfQuote);

//Obtener el detalle de una cotizacion sin actualizar nada 
router.post('/cotizacion_detalle/:id', CotizacionesController.getCotizacionesDetalle);

//V3 update cotizacion General
router.post('/v3_update_cotizacion_general', auth.verifyToken, CotizacionesController.V3updateCotizacionGeneral);

//V3 update cotizacion lineas ALL inicio
router.get('/v3_update_cotizacion_inicio/:id', CotizacionesController.V3updateCotizacionesInicio);

//v3 update cotizacion general terminos y condiciones
router.post('/v3_update_terminos_y_condiciones', auth.verifyToken, CotizacionesController.V3updateTerminosYCondiciones);

//V4 test update cotizacion lineas ALL inicio
router.get('/v4_update_cotizacion_inicio/:id', CotizacionesController.V4updateCotizacionInicio);

//V3 Editar cantidades cotizacion lineas
router.post('/v3_update_cotizaciones_cantidades_lineas', CotizacionesController.V3UpdateLineasCantidades);



export default router;