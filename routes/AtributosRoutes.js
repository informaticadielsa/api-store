import routerx from 'express-promise-router';
import atributosController from '../controllers/AtributosController';
import auth from '../middlewares/auth';

const router = routerx();


//Recuperacion de datos
router.post('/AllAttFromProductoPadreCategoria', auth.verifyToken, atributosController.getProductoAtributosCategoriasValores);
router.post('/AllCategoriasAtributos', auth.verifyToken, atributosController.getCategoriasAtributos);



router.post('/getProductoAtributos', auth.verifyToken, atributosController.getProductoAtributos);
router.post('/getSKUAtributosProductosValores', auth.verifyToken, atributosController.getSKUAtributosProductosValores);






router.get('/testing', auth.verifyToken, atributosController.testing);


router.get('/addAttributesFromExcel', auth.verifyToken, atributosController.addAttributesFromExcel);


router.get('/addCamposProductosFromExcel', auth.verifyToken, atributosController.addCamposProductosFromExcel);
router.post('/getVinetaFromProduct', auth.verifyToken, atributosController.getVinetaFromProduct);



//router.post('/AllSKUAtributos', auth.verifyToken, atributosController.getSKUAtributos);



//APIS SIN TOKEN FRONT ATTR
router.post('/AllCategoriasAtributosST', atributosController.getCategoriasAtributosST);
router.get('/getValuesFromAtributteST/:IDAtribute', atributosController.getValuesFromAtributteST);
router.post('/getProductosByFiltroAtributoPadresST/', atributosController.getProductosByFiltroAtributoPadresST);

router.post('/getSKUAtributosProductosValoresST', atributosController.getSKUAtributosProductosValoresST);



//Atributos FULL
router.get('/listAttributes', auth.verifyToken, atributosController.getListAtributos);
router.post('/createAttribute', auth.verifyToken, atributosController.createAtributo);
router.put('/updateAttribute', auth.verifyToken, atributosController.updateAtributo);
router.delete('/deleteAttribute', auth.verifyToken, atributosController.deleteAtributo);
router.get('/listByName/:nombre', auth.verifyToken, atributosController.getAtributoByName);
router.post('/testAtributosPaginacion', auth.verifyToken, atributosController.testAtributosPaginacion);

router.get('/getAllAtributosPadres', auth.verifyToken, atributosController.getAllAtributosPadres);
router.get('/getValuesFromAtributte/:IDAtribute', auth.verifyToken, atributosController.getValuesFromAtributte);



//Atributos Productos, Relacion de que productos tendra que atributo
router.get('/listAttributesProducts', auth.verifyToken, atributosController.getListAtributosProductos);
router.post('/createAttributeProducts', auth.verifyToken, atributosController.createAtributoProductos);
router.put('/updateAttributeProducts', auth.verifyToken, atributosController.updateAtributoProducto);
router.delete('/deleteAttributeProducts', auth.verifyToken, atributosController.deleteAtributoProductos);


//Atributos SKU VALORES, Relacion de que productos tendra que atributo
router.get('/listAttributesSKUValores', auth.verifyToken, atributosController.getListAtributosSKUValor);
router.post('/createAttributeSKUValores', auth.verifyToken, atributosController.createAtributoSKUValor);
router.put('/updateAttributeSKUValores', auth.verifyToken, atributosController.updateAtributoSKUValor);
router.delete('/deleteAttributeSKUValores', auth.verifyToken, atributosController.deleteAtributoSKUValor);


//Atributos Productos, Relacion de que productos tendra que atributo
router.get('/listAttributesCategories', auth.verifyToken, atributosController.getListAtributosCategorias);
router.post('/createAttributeCategories', auth.verifyToken, atributosController.createAtributoCategorias);
router.put('/updateAttributeCategories', auth.verifyToken, atributosController.updateAtributoCategorias);
router.delete('/deleteAttributeCategories', auth.verifyToken, atributosController.deleteAtributoCategorias);


//Atributos SKU VALORES, Relacion de que productos tendra que atributo
router.get('/listAttributesProductValues', auth.verifyToken, atributosController.getListAtributosProductosValores);
router.post('/createAttributeProductValues', auth.verifyToken, atributosController.createAtributoProductosValores);
router.put('/updateAttributeProductValues', auth.verifyToken, atributosController.updateAtributoProductosValores);
router.delete('/deleteAttributeProductValues', auth.verifyToken, atributosController.deleteAtributoProductosValores);




export default router;