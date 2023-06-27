import routerx from 'express-promise-router';
import IntegracionesInfoTransferController from '../controllers/IntegracionesInfoTransferController';
import auth from '../middlewares/auth';

const router = routerx();

//Integra el tipo de cambio del dia
router.get('/IntegracionInfoTransferTipoCambioUSD', IntegracionesInfoTransferController.IntegracionInfoTransferTipoCambioUSD);

//Socios Negocios Integracion
router.get('/IntegracionInfoTransferSociosNegocios', IntegracionesInfoTransferController.IntegracionInfoTransferSociosNegocios);

//Socios Negocios Integracion Only One
router.post('/IntegracionInfoTransferSociosNegociosOnlyOne', IntegracionesInfoTransferController.IntegracionInfoTransferSociosNegociosOnlyOne);


//Socios Negocios Direcciones Integracion
router.get('/IntegracionInfoTransferSociosNegociosDirecciones', IntegracionesInfoTransferController.IntegracionInfoTransferSociosNegociosDirecciones);

//Socios Negocios Direcciones Integracion ONLY ONE
router.post('/IntegracionInfoTransferSociosNegociosDireccionesOnlyOne', IntegracionesInfoTransferController.IntegracionInfoTransferSociosNegociosDireccionesOnlyOne);




//Socios Negocios Descuentos Integracion
router.get('/IntegracionInfoTransferSociosNegociosDescuentos', IntegracionesInfoTransferController.IntegracionInfoTransferSociosNegociosDescuentos);




//Socios Negocios asignarles vendedor
router.get('/IntegracionInfoTransferAsignarSNAVendedores', IntegracionesInfoTransferController.IntegracionInfoTransferAsignarSNAVendedores);


//Almacenes Integracion
router.get('/IntegracionInfoTransferAlmacenes', IntegracionesInfoTransferController.IntegracionInfoTransferAlmacenes);


//Productos Categorias Integracion (Requisito antes de integrar productos)
router.get('/IntegracionInfoTransferCategorias', IntegracionesInfoTransferController.IntegracionInfoTransferCategorias);


//Integrar Marcas a partir de la tabla articulos (Requisito antes de integrar productos) -> Pedir WS
router.get('/IntegracionInfoTransferMarcas', IntegracionesInfoTransferController.IntegracionInfoTransferMarcas);


//Integrar Productos
router.get('/IntegracionInfoTransferProductos', IntegracionesInfoTransferController.IntegracionInfoTransferProductos);


//Integrar Inventarios
router.get('/IntegracionInfoTransferInventarios', IntegracionesInfoTransferController.IntegracionInfoTransferInventarios);


//Integrar Inventarios
router.post('/IntegracionInfoTransferInventariosOnlyOne', IntegracionesInfoTransferController.IntegracionInfoTransferInventariosOnlyOne);


//Integrar Inventarios detalle (solo fibra optica 120 cod grupo)
router.get('/IntegracionInfoTransferInventariosDetalle', IntegracionesInfoTransferController.IntegracionInfoTransferInventariosDetalle);




//Listas de Precios nombres y codigos
router.get('/IntegracionInfoTransferListasPrecios', IntegracionesInfoTransferController.IntegracionInfoTransferListasPrecios);

//Listas de Precios x lista pcp
router.get('/IntegracionInfoTransferProductosListasPrecios', IntegracionesInfoTransferController.IntegracionInfoTransferProductosListasPrecios);


//Mandar Precio a Prod_producto_precio prod_precio tabla productos
router.get('/IntegracionInfoTransferProductosPreciosListasPrecios', IntegracionesInfoTransferController.IntegracionInfoTransferProductosPreciosListasPrecios);

//Settea el prod_precio base de un producto a partir de los 3 tipos de listas de precios
router.get('/IntegracionInfoTransferProductosSetPrecioBaseFromListasPrecios', IntegracionesInfoTransferController.IntegracionInfoTransferProductosSetPrecioBaseFromListasPrecios);



//Listas de Precios x lista pcp
router.post('/IntegracionInfoTransferProductosListasPreciosOnlyOne', IntegracionesInfoTransferController.IntegracionInfoTransferProductosListasPreciosOnlyOne);

//Crear Orden SAP
router.post('/IntegracionCrearOrdenSap', IntegracionesInfoTransferController.IntegracionCrearOrdenSap);

//Crear Orden SAP validaciones precias a insertar
router.post('/IntegracionCrearOrdenSapVALIDACIONESPREVIAS', IntegracionesInfoTransferController.IntegracionCrearOrdenSapVALIDACIONESPREVIAS);

//Crearcion de ordenes sap automaticas con status diferente de 2
router.get('/IntegracionAutoCrearOrdenSap', IntegracionesInfoTransferController.IntegracionAutoCrearOrdenSap);



//Autorizar Orden SAP
router.post('/IntegracionAutorizarOrdenSap', IntegracionesInfoTransferController.IntegracionAutorizarOrdenSap);


//Crear Orden SAP
router.get('/IntegracionActualizarOrdenes', IntegracionesInfoTransferController.IntegracionActualizarOrdenes);


//Integrar Paises y Estados
router.get('/IntegracionInfoTransferPaisesEstados', IntegracionesInfoTransferController.IntegracionInfoTransferPaisesEstados);


//Integrar Fleteras
router.get('/IntegracionInfoTransferFleteras', IntegracionesInfoTransferController.IntegracionInfoTransferFleteras);


//Integrar vendedeores sap custom PCP
router.get('/IntegracionInfoTransferVendedoresSap', IntegracionesInfoTransferController.IntegracionInfoTransferVendedoresSap);


//Integrar Facturas from CompasFinalizadas orden id
router.get('/IntegracionInfoTransferFacturasSAP', IntegracionesInfoTransferController.IntegracionInfoTransferFacturasSAP);


//Integrar Productos total Stock from pcp to pcp
router.get('/IntegracionInfoTransferTotalStockToProductoHijos', IntegracionesInfoTransferController.IntegracionInfoTransferTotalStockToProductoHijos);


//Integrar Productos total Stock from pcp to pcp
router.get('/IntegracionInfoTransferTotalStockToProductoPadresEHijos', IntegracionesInfoTransferController.IntegracionInfoTransferTotalStockToProductoPadresEHijos);



//Integrar Productos total Stock from pcp to pcp
router.get('/IntegracionInfoTransferSNtoSNUEmailPassword', IntegracionesInfoTransferController.IntegracionInfoTransferSNtoSNUEmailPassword);




//Integrar Productos total Stock from pcp to pcp
router.get('/testingCrons', IntegracionesInfoTransferController.testingCrons);


//Integracion
router.get('/front_integrar_productos', IntegracionesInfoTransferController.IntegracionRawArticulosAndInfoTransferProductos);


//Autorizar Orden SAP
router.get('/IntegracionCorreos', IntegracionesInfoTransferController.IntegracionCorreos);


export default router;