import routerx from 'express-promise-router';
import RawIntegracionesController from '../controllers/RawIntegracionesController';
import auth from '../middlewares/auth';

const router = routerx();

//Socios Negocios Integracion
router.get('/IntegracionSociosNegocios', RawIntegracionesController.rawIntegracionSociosNegocios);

//Socios Negocios Integracion onlyONE
router.post('/IntegracionSociosNegociosOnlyOne', RawIntegracionesController.rawIntegracionSociosNegociosOnlyOne);


//Propiedades Socios Negocios Integracion
router.get('/IntegracionSnPropiedades', RawIntegracionesController.rawIntegracionSnPropiedades);

//Grupos Socios Negocios Integracion
router.get('/IntegracionSnGrupos', RawIntegracionesController.rawIntegracionSnGrupos);

//Articulos Integracion
router.get('/IntegracionArticulos', RawIntegracionesController.rawIntegracionArticulos);

//Articulos Propiedades Integracion
router.get('/IntegracionArticulosPropiedades', RawIntegracionesController.rawIntegracionArticulosPropiedades);

//Articulos Grupos Integracion
router.get('/IntegracionArticulosGrupos', RawIntegracionesController.rawIntegracionArticulosGrupos);

//Articulos Grupos Bom
router.get('/IntegracionArticulosBom', RawIntegracionesController.rawIntegracionArticulosBom);

//Articulos Almacenes
router.get('/IntegracionAlmacenes', RawIntegracionesController.rawIntegracionAlmacenes);





//Articulos Inventario
router.get('/IntegracionInventario', RawIntegracionesController.rawIntegracionInventario);
router.get('/rawIntegracionInventarioAllApis', RawIntegracionesController.rawIntegracionInventarioAllApis);

//Articulos Inventario All productos in BD
router.get('/rawIntegracionInventarioAllProductosInBD', RawIntegracionesController.rawIntegracionInventarioAllProductosInBD);

//Articulos Inventario ONLY ONE
router.post('/rawIntegracionInventarioOnlyOne', RawIntegracionesController.rawIntegracionInventarioOnlyOne);





//Nombre Listas Precios Basicos
router.get('/IntegracionNombreListasPrecios', RawIntegracionesController.rawIntegracionNombreListasPrecios);







//Lista Precios Basicos
router.get('/IntegracionListasPreciosBasicas', RawIntegracionesController.rawIntegracionListasPreciosBasicas);

//Lista Precios Basicos Only one
router.get('/IntegracionListasPreciosBasicasAllProductosInBD', RawIntegracionesController.IntegracionListasPreciosBasicasAllProductosInBD);

//Lista Precios Basicos Only one
router.post('/IntegracionListasPreciosBasicasOnlyOne', RawIntegracionesController.IntegracionListasPreciosBasicasOnlyOne);






//Lista Precios Periodo
router.get('/IntegracionListasPreciosPeriodo', RawIntegracionesController.rawIntegracionListasPreciosPeriodo);

//Lista Precios Cantidad
router.get('/IntegracionListasPreciosCantidad', RawIntegracionesController.rawIntegracionListasPreciosCantidad);

//Lista Precios Grupo
router.get('/IntegracionListasPreciosGrupo', RawIntegracionesController.rawIntegracionListasPreciosGrupo);

//Lista Precios Especiales
router.get('/IntegracionListasPreciosEspeciales', RawIntegracionesController.rawIntegracionListasPreciosEspeciales);

//Inventario Detalle
router.get('/IntegracionInventarioDetalle', RawIntegracionesController.rawIntegracionInventarioDetalle);





export default router;