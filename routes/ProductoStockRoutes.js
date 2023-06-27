import routerx from 'express-promise-router';
import productoStockController from '../controllers/ProductoStockController';
import auth from '../middlewares/auth';

const router = routerx();
// router.post('/add', auth.verifyToken, productoStockController.createProducto);
// router.put('/update', auth.verifyToken, productoStockController.updateProducto);
// router.get('/producto_father/:id', auth.verifyToken, productoStockController.getProductoById);
router.get('/getStock', auth.verifyToken, productoStockController.getListProductosStock);
router.get('/getStockFiltro/:caso/:valorBusqueda/:idAlmacenVirtual', auth.verifyToken, productoStockController.getStokcFiltros);
router.get('/getStockByAlmacen/:id', auth.verifyToken, productoStockController.getListProductosStockByAlmacen);
router.post('/getStockByMarca/', auth.verifyToken, productoStockController.getListProductosStockByMarca);
router.post('/getStockByCategoria/', auth.verifyToken, productoStockController.getListProductosStockByCategoria);
router.post('/getStockBySKU/', auth.verifyToken, productoStockController.getListProductosStockBySKU);
router.put('/stock_add', auth.verifyToken, productoStockController.updateStockProducto);


// router.get('/onlyid/:id', auth.verifyToken, productoStockController.getOnlyById);
// router.delete('/delete', auth.verifyToken, productoStockController.deleteProducto);
// router.get('/listaToProducto', auth.verifyToken, productoStockController.getListaProductosHijos);
export default router;