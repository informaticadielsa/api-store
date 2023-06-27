import routerx from 'express-promise-router';
import V2CarritoCompraController from '../controllers/V2CarritoDeComprasController';
import auth from '../middlewares/auth';

const router = routerx();

//Creación de carrito
router.post('/get_cart', V2CarritoCompraController.getCart);

//Agregar articulo de carrito
router.post('/add_product_to_cart', V2CarritoCompraController.addProductToCart);

//Borrar articulo de carrito
router.post('/delete_product_to_cart', V2CarritoCompraController.deleteProductToCart);


//Agregar articulo de carrito para productos que sean fibra optica
router.post('/add_product_to_cart_fibra', V2CarritoCompraController.addProductToCartFibra);

//Borrar articulo de carrito para productos que sean fibra optica
router.post('/delete_product_to_cart_fibra', V2CarritoCompraController.deleteProductToCartFibra);




//Asignar cupon a carrito
router.post('/asign_coupon', V2CarritoCompraController.asignCoupon);

//Asignar cupon a carrito
router.post('/asign_reference', V2CarritoCompraController.asignReference);

//desasignar cupon del carrito
router.post('/delete_coupon_cart', V2CarritoCompraController.deleteCouponOnCart);

//Asignar cfdi a carrito
router.post('/asign_cfdi', V2CarritoCompraController.asignCFDI);



//set cart shipping details
router.post('/set_cart_shipping_detail', V2CarritoCompraController.setCartShippingDetail);

//set cart tipo compra
router.post('/set_cart_tipo_compra', V2CarritoCompraController.setCartTipoCompra);


//checkout carrito
router.post('/get_V2_checkout', V2CarritoCompraController.getV2Checkout);





//checkout carrito
router.post('/get_V2_checkout_resumen_MXN_USD', V2CarritoCompraController.get_V2_checkout_resumen_MXN_USD);








//checkout carrito
router.post('/getPreOrdenDividida', V2CarritoCompraController.getPreOrdenDividida);








//Prevalidar Carrito
router.post('/prevalidar_carrito', V2CarritoCompraController.prevalidarCarrito);

//Prevalidar Carrito
router.post('/prevalidar_carrito_sin_stock', V2CarritoCompraController.prevalidarCarritoSinStock);





//test
router.post('/test', V2CarritoCompraController.test);


export default router;