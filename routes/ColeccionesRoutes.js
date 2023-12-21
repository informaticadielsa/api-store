import routerx from 'express-promise-router';
import ColeccionesController from '../controllers/ColeccionesController';
import auth from '../middlewares/auth';
import upload from '../services/storage';
const router = routerx();
//Creamos coleccion
router.post('/create-collection', ColeccionesController.createCollection);
router.get('/list-collections',ColeccionesController.getCollections );
router.get('/collections/:id', ColeccionesController.getCollectionIdFind);
router.get('/collection/:id', ColeccionesController.getCollectionIdFind2);
router.get('/colecctions-products/:id', ColeccionesController.getCollectionProducts)
router.post('/upload-file-products', upload.array('excel', 5), ColeccionesController.uploadExcelProductsCollection);
router.post('/update-products-collection',  ColeccionesController.updateCollectionProducts);
router.post('/update-product-collection',  ColeccionesController.updateProductCollection);
router.post('/update-collection',  ColeccionesController.updateCollection);



/*//Actualizamos la coleccion
router.put('/update', auth.verifyToken, coleccionController.updateColeccion);

//Actualizamos la coleccion
router.post('/update_producto_coleccion_relacion', auth.verifyToken, coleccionController.updateProductoColeccionRelacion);

//Delete colecccion
router.delete('/delete', auth.verifyToken, coleccionController.deleteColeccion);
//getColección detalle
router.get('/coleccion/:id', auth.verifyToken, coleccionController.getColeccionById);

//getColección detalle
router.get('/coleccion_store/:id', coleccionController.getColeccionById);

//Get LIST Colecciones
router.get('/list', auth.verifyToken, coleccionController.getListColecciones);
//Listado publico 
router.get('/list_public/:tipo', coleccionController.getListadoColeccionesPublica);*/
export default router;