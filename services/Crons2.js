import cron from "node-cron";
import config from '../config';
import integrations from "./Integraciones"


//Alternativos

//Actualizar el tipo de cambio
cron.schedule("0 5 * * *", () =>{integrations.ExecuteEndpoint("/api/integraciones_info_transfer/IntegracionInfoTransferTipoCambioUSD")});
cron.schedule("0 9 * * *", () =>{integrations.ExecuteEndpoint("/api/integraciones_info_transfer/IntegracionInfoTransferTipoCambioUSD")});

//CORRER GENERADOR DE TOTAL PRODUCTOS VENDIDOS PARA LA TABLA PRODUCTOS 1 O 2 VECES AL DIA
cron.schedule("0 5 * * *", () =>{integrations.ExecuteEndpoint("/api/productos/cargarProductosMasVendidos")});

//Mandar correos cada 30 minutos de correos actualizados
cron.schedule("*/30 * * * *", () =>{integrations.ExecuteEndpoint("/api/integraciones_info_transfer/IntegracionCorreos/")});

//actualizar ordenes cada 2 minutos
cron.schedule("*/2 * * * *", () =>{integrations.ExecuteEndpoint("/api/integraciones_info_transfer/IntegracionActualizarOrdenes/")});





//Integraciones
// 1 Paises y estados                               [INFO Transfer]
cron.schedule("0 0 * * 0", () =>{integrations.ExecuteEndpoint("/api/integraciones_info_transfer/IntegracionInfoTransferPaisesEstados/")});

// // 2 codigos postales (excel)                    [INFO Transfer]
// cron.schedule("0 0 * * *", () =>{integrations.ExecuteEndpoint("/api/pais/codigoPostales")});

// // 3 Fleteras                                    [INFO Transfer]
// cron.schedule("0 0 * * *", () =>{integrations.ExecuteEndpoint("/api/integraciones_info_transfer/IntegracionInfoTransferFleteras/")});

// 4 Marcas                                         [INFO Transfer]
cron.schedule("0 0 * * *", () =>{integrations.ExecuteEndpoint("/api/integraciones_info_transfer/IntegracionInfoTransferMarcas/")});

// 5 Articulos Grupos (categorias)                  [RAW Integrations]
cron.schedule("3 0 * * *", () =>{integrations.ExecuteEndpoint("/api/rawintegraciones/IntegracionArticulosGrupos/")});

// 5.1 Articulos propiedaes 			            [RAW Integrations]
cron.schedule("4 0 * * *", () =>{integrations.ExecuteEndpoint("/api/rawintegraciones/IntegracionArticulosGrupos/")});

// 6 Categorias                                     [INFO Transfer]
cron.schedule("5 0 * * *", () =>{integrations.ExecuteEndpoint("/api/integraciones_info_transfer/IntegracionInfoTransferCategorias/")});

// 7 Almacenes                                      [RAW Integrations]
cron.schedule("7 0 * * *", () =>{integrations.ExecuteEndpoint("/api/rawintegraciones/IntegracionAlmacenes/")});

// 8 Almacenes                                      [INFO Transfer]
cron.schedule("8 0 * * *", () =>{integrations.ExecuteEndpoint("/api/integraciones_info_transfer/IntegracionInfoTransferAlmacenes/")});

// 9 Nombre Listas Precios                          [RAW Integrations]
cron.schedule("10 0 * * *", () =>{integrations.ExecuteEndpoint("/api/rawintegraciones/IntegracionNombreListasPrecios")});

// 10 Nombre Listas Precios                         [INFO Transfer]
cron.schedule("11 0 * * *", () =>{integrations.ExecuteEndpoint("/api/integraciones_info_transfer/IntegracionInfoTransferListasPrecios/")});

// 11 Productos                                     [RAW Integrations]
cron.schedule("30 0 * * *", () =>{integrations.ExecuteEndpoint("/api/rawintegraciones/IntegracionArticulos/")}); 

// 12 Integrar productos                            [INFO Transfer]
cron.schedule("45 0 * * *", () =>{integrations.ExecuteEndpoint("/api/integraciones_info_transfer/IntegracionInfoTransferProductos/")}); 





// 13 Integracion Listas Precios Basicos            [RAW Integrations]
// cron.schedule("0 1 * * *", () =>{integrations.ExecuteEndpoint("/api/rawintegraciones/IntegracionListasPreciosBasicasAllProductosInBD")});
cron.schedule("5 5 * * *", () =>{integrations.ExecuteEndpoint("/api/rawintegraciones/IntegracionListasPreciosBasicas")});
// 14 Listas de precios Basicos (Solo listas)       [INFO Transfer]
cron.schedule("10 5 * * *", () =>{integrations.ExecuteEndpoint("/api/integraciones_info_transfer/IntegracionInfoTransferProductosListasPrecios/")});
// 15 Precios Base Set                              [INFO Transfer]
cron.schedule("15 5 * * *", () =>{integrations.ExecuteEndpoint("/api/integraciones_info_transfer/IntegracionInfoTransferProductosSetPrecioBaseFromListasPrecios/")});


// 13 Integracion Listas Precios Basicos            [RAW Integrations]
// cron.schedule("0 1 * * *", () =>{integrations.ExecuteEndpoint("/api/rawintegraciones/IntegracionListasPreciosBasicasAllProductosInBD")});
cron.schedule("5 9 * * *", () =>{integrations.ExecuteEndpoint("/api/rawintegraciones/IntegracionListasPreciosBasicas")});
// 14 Listas de precios Basicos (Solo listas)       [INFO Transfer]
cron.schedule("10 9 * * *", () =>{integrations.ExecuteEndpoint("/api/integraciones_info_transfer/IntegracionInfoTransferProductosListasPrecios/")});
// 15 Precios Base Set                              [INFO Transfer]
cron.schedule("15 9 * * *", () =>{integrations.ExecuteEndpoint("/api/integraciones_info_transfer/IntegracionInfoTransferProductosSetPrecioBaseFromListasPrecios/")});



//16, 17 y 18 Integracion Inventario                        [RAW Integrations]
cron.schedule("*/5 * * * *", () =>{integrations.ExecuteEndpoint("/api/rawintegraciones/rawIntegracionInventarioAllApis")});


//16 Integracion Inventario                        [RAW Integrations]
// cron.schedule("*/3 * * * *", () =>{integrations.ExecuteEndpoint("/api/rawintegraciones/IntegracionInventario")});

// // 16 Integracion Inventario                        [RAW Integrations]
// cron.schedule("0 2 * * *", () =>{integrations.ExecuteEndpoint("/api/rawintegraciones/rawIntegracionInventarioAllProductosInBD")});
// // 16 Integracion Inventario                        [RAW Integrations]
// cron.schedule("0 10 * * *", () =>{integrations.ExecuteEndpoint("/api/rawintegraciones/rawIntegracionInventarioAllProductosInBD")});
// // 16 Integracion Inventario                        [RAW Integrations]
// cron.schedule("0 18 * * *", () =>{integrations.ExecuteEndpoint("/api/rawintegraciones/rawIntegracionInventarioAllProductosInBD")});



// 17 Integracion Inventarios                       [INFO Transfer]
// cron.schedule("*/4 * * * *", () =>{integrations.ExecuteEndpoint("/api/integraciones_info_transfer/IntegracionInfoTransferInventarios/")});
// // 17 Integracion Inventarios                       [INFO Transfer]
// cron.schedule("10 2 * * *", () =>{integrations.ExecuteEndpoint("/api/integraciones_info_transfer/IntegracionInfoTransferInventarios/")});
// // 17 Integracion Inventarios                       [INFO Transfer]
// cron.schedule("10 10 * * *", () =>{integrations.ExecuteEndpoint("/api/integraciones_info_transfer/IntegracionInfoTransferInventarios/")});
// // 17 Integracion Inventarios                       [INFO Transfer]
// cron.schedule("10 18 * * *", () =>{integrations.ExecuteEndpoint("/api/integraciones_info_transfer/IntegracionInfoTransferInventarios/")});



// 18 Stock Padres e Hijos                          [INFO Transfer]
// cron.schedule("*/5 * * * *", () =>{integrations.ExecuteEndpoint("/api/integraciones_info_transfer/IntegracionInfoTransferTotalStockToProductoPadresEHijos/")});
// // 18 Stock Padres e Hijos                          [INFO Transfer]
// cron.schedule("20 2 * * *", () =>{integrations.ExecuteEndpoint("/api/integraciones_info_transfer/IntegracionInfoTransferTotalStockToProductoPadresEHijos/")});
// // 18 Stock Padres e Hijos                          [INFO Transfer]
// cron.schedule("20 10 * * *", () =>{integrations.ExecuteEndpoint("/api/integraciones_info_transfer/IntegracionInfoTransferTotalStockToProductoPadresEHijos/")});
// // 18 Stock Padres e Hijos                          [INFO Transfer]
// cron.schedule("20 18 * * *", () =>{integrations.ExecuteEndpoint("/api/integraciones_info_transfer/IntegracionInfoTransferTotalStockToProductoPadresEHijos/")});






//SOCIOS DE NEGOCIO

// 20 Sn Grupos                                     [RAW Integrations]
cron.schedule("30 1 * * *", () =>{integrations.ExecuteEndpoint("/api/rawintegraciones/IntegracionSnGrupos/")});

// 21 Sn Propiedades                                [RAW Integrations]
cron.schedule("33 1 * * *", () =>{integrations.ExecuteEndpoint("/api/rawintegraciones/IntegracionSnPropiedades/")});

// // 22 Vendedores SAP (validar que funcione)         [INFO Transfer]
// cron.schedule("2 0 * * *", () =>{integrations.ExecuteEndpoint("/api/integraciones_info_transfer/IntegracionInfoTransferVendedoresSap/")});

// // 23 Asignar SN a vendededores_sap                 [INFO Transfer]
// cron.schedule("2 0 * * *", () =>{integrations.ExecuteEndpoint("/api/integraciones_info_transfer/IntegracionInfoTransferAsignarSNAVendedores/")});

// 24 Socios de negocio RAW                         [RAW Integrations]
cron.schedule("40 1 * * *", () =>{integrations.ExecuteEndpoint("/api/rawintegraciones/IntegracionSociosNegocios/")});

// 25 Socios de negocio                             [INFO Transfer]
cron.schedule("50 1 * * *", () =>{integrations.ExecuteEndpoint("/api/integraciones_info_transfer/IntegracionInfoTransferSociosNegocios/")});

// 26 Socios de negocio Direcciones                 [INFO Transfer]
cron.schedule("55 1 * * *", () =>{integrations.ExecuteEndpoint("/api/integraciones_info_transfer/IntegracionInfoTransferSociosNegociosDirecciones/")});









