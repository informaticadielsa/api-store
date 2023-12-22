import routerx from 'express-promise-router';
import fileUploadController from '../controllers/FileUploadController';
import auth from '../middlewares/auth';
import upload from '../services/storage';
const router = routerx();
//Cargar rar
router.post('/upload', auth.verifyToken, upload.array('products', 12), fileUploadController.uploadZipFileV3);

router.post('/upload_data_sheet', auth.verifyToken, upload.array('files', 12), fileUploadController.uploadZipDataSheet);

//Cargar rar V2 
router.post('/upload_v2', upload.array('products', 5), fileUploadController.uploadZipFileV2);


//Cargar rar V3
router.post('/upload_v3', upload.array('products', 5), fileUploadController.uploadZipFile);












//Eliminar un archivo especifico (Producto)
router.delete('/delete', auth.verifyToken, fileUploadController.deleteFileOfProduct);
//File to product 
router.post('/file_to_product', auth.verifyToken, upload.array('files', 15), fileUploadController.uploadFileToProduct);

//Ficha tecnica de producto 
router.post('/data_sheet', auth.verifyToken, upload.array('files', 1), fileUploadController.uploadDataSheetProduct);
router.get('/data_sheet_length/:productId', fileUploadController.getDataSheetProductLength);
router.get('/data_sheet/:prod_sku/:position', fileUploadController.getDataSheetProduct);
//Eliminar archivo 
router.delete('/delete_data_sheet', auth.verifyToken, fileUploadController.deleteFileDataSheet);



//Checkout file 
router.post('/purchase_order', auth.verifyToken, upload.array('files', 1), fileUploadController.uploadPurchaseOrder);
router.get('/purchase_order/:numOrder', auth.verifyToken, fileUploadController.getPurchaseOrder);

router.post('/purchase_order_sn', auth.verifyTokenSocioNegocio, upload.array('files', 1), fileUploadController.uploadPurchaseOrder);
router.get('/purchase_order_sn/:numOrder', auth.verifyTokenSocioNegocio, fileUploadController.getPurchaseOrder);



//Archivos de Inicio
router.post('/carga_main', auth.verifyToken, upload.array('files', 5), fileUploadController.cargaFileToMain);
//Get Archivo, imagenes home (Imagenes libres)
router.get('/get_file/:type', fileUploadController.getArchivoByType);
//Update status archivo
router.put('/update_status_file', auth.verifyToken, fileUploadController.updateStatusFile);
//Eliminamos archivos del home
router.delete('/delete_file_home', auth.verifyToken, fileUploadController.deleteFileOfHome);

//Cargar excel
router.post('/excel_file', auth.verifyToken, upload.array('excel', 5), fileUploadController.fileExcelUplad);

router.post('/excel_carga_masiva', auth.verifyToken, upload.array('excel', 1), fileUploadController.fileExcelCargaMasivaUpload);


router.post('/excel_quick_shop', auth.verifyTokenSocioNegocio, upload.array('excel', 1), fileUploadController.QuickShopExcelUpload);

router.post('/excel_categories_change', auth.verifyToken, upload.array('excel', 1), fileUploadController.CategoryChangeExcelUpload);


//Cargamos archivos de solicitud de credito 
router.post('/documentos_solicitud_credito', upload.array('files', 1), auth.verifyTokenSocioNegocio, fileUploadController.uploadFileSolicitudDeCredito);
router.post('/documentos_socio', auth.verifyToken, fileUploadController.downloadFile);
export default router;