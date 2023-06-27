import routerx from 'express-promise-router';
import productoController from '../controllers/ProductoController';
import auth from '../middlewares/auth';
const router = routerx();

router.post('/add', auth.verifyToken, productoController.createProducto);
router.put('/update', auth.verifyToken, productoController.updateProducto);
router.get('/producto_father/:id', auth.verifyToken, productoController.getProductoById);
router.get('/list', auth.verifyToken, productoController.getListProductos);
router.get('/onlyid/:id', auth.verifyToken, productoController.getOnlyById);
router.delete('/delete', auth.verifyToken, productoController.deleteProducto);
router.get('/listaToProducto', auth.verifyToken, productoController.getListaProductosHijos);

router.post('/listPaginada', auth.verifyToken, productoController.getListProductosPaginada);
router.post('/listaToProductoPaginada', auth.verifyToken, productoController.getListaProductosHijosPaginada);



//Sin token
router.get('/lista_productos_hijos', productoController.getListaProductosHijos);
router.get('/producto_father_detalle/:id', productoController.getProductoById);
router.post('/mejor_descuento/socio/:idSocio', productoController.mejorDescuentoProducto);
router.post('/getProductosByFiltroPadresST', productoController.getProductosByFiltroPadres);



router.post('/frontGetProductoMain', productoController.frontGetProductoMain);
router.post('/frontGetProductoMainV2', productoController.frontGetProductoMainV2);
router.post('/frontGetProductoAdvancedSearch', productoController.frontGetProductoAdvancedSearch);
router.post('/getListaBySKUHijos/', productoController.getListaBySKUHijos);
router.post('/getListaBySKUHijosPromociones/', productoController.getListaBySKUHijosPromociones);


//admin?
router.post('/getProductosByFiltroPadres/', productoController.getProductosByFiltroPadres);
router.post('/getProductosByFiltroAtributoPadres/', productoController.getProductosByFiltroAtributoPadres);


//Front
router.post('/getProductosByFiltroPadres_Front_ST/', productoController.getProductosByFiltroPadres_Front_ST);
router.post('/frontGetProductoAdvancedSearch_Front_ST/', productoController.frontGetProductoAdvancedSearch_Front_ST);


router.get('/get_product_father_from_child/:id', productoController.getPadreDesdeHijo);


router.post('/addCarritoSKUFromExcel', productoController.addCarritoSKUFromExcel);
router.get('/cargarProductosMasVendidos', productoController.cargarProductosMasVendidos);

router.post('/GetProductsAdmin', productoController.getProductsAdmin);


router.post('/frontGetProductoMainV3', productoController.frontGetProductoMainV3);
router.post('/frontGetProductoMainV3OnlyChilds', productoController.frontGetProductoMainV3OnlyChilds);
router.post('/frontGetProductoMainV3OnlyChildsV2', productoController.frontGetProductoMainV3OnlyChildsV2);
router.post('/frontGetProductoAdvancedSearchV3', productoController.frontGetProductoAdvancedSearchV3);
router.post('/frontGetProductoAdvancedSearchV3OnlyChilds', productoController.frontGetProductoAdvancedSearchV3OnlyChilds);
router.post('/frontGetProductoByCategoriaV3', productoController.frontGetProductoByCategoriaV3);
router.post('/frontGetProductoByCategoriaV3OnlyChilds', productoController.frontGetProductoByCategoriaV3OnlyChilds);

router.post('/frontGetProductoMainV4', productoController.frontGetProductoMainV4);

//Get detalle
router.post('/getProductoPadreDetalleV3', productoController.getProductoFatherDetalleV3);
router.post('/getProductoPadreDetalleV3OneChild', productoController.getProductoFatherDetalleV3OneChild);
router.post('/getProductoPadreDetalleV3OneChildByForeignName', productoController.getProductoFatherDetalleV3OneChildByForeignName);
router.post('/getProductoPadreDetalleV3OnlyAttributes', productoController.getProductoFatherDetalleV3OnlyAttributes);


export default router;

