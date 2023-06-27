import routerx from 'express-promise-router';
import CarritoCompraController from '../controllers/CarritoDeComprasController';
import auth from '../middlewares/auth';

const router = routerx();
//RESTRUCTURACIÓN 
//Actualizar carrito (henry)
router.put('/update', auth.verifyTokenSocioNegocio, CarritoCompraController.updateCar);
router.put('/update_admin', auth.verifyToken, CarritoCompraController.updateCar);



//Creación de carrito
router.post('/create', CarritoCompraController.createCarShop);
//Agregar producto a carrito
router.post('/add_product', CarritoCompraController.addProductCarShop);
//Eliminar producto de carrito de compra
router.delete('/delete_product', CarritoCompraController.deleteProductCarShop);
//Eliminamos el carrito completo
router.delete('/delete_carrito', CarritoCompraController.deleteCarShop);
//Obtener Carrrito 
router.get('/carrito/:id', CarritoCompraController.getCarShopById);
//Validamos el carrito y los descuentos
router.post('/validar_cupon/:id', CarritoCompraController.applyCoupon);
//Convertir carrito a cotizacion/proyecto
router.post('/crearCotizacion', auth.verifyToken,  CarritoCompraController.converterCarShopToCotizacionProyecto);
//Convertir carrito a cotizacion/proyecto
router.post('/crearCotizacion_sn', auth.verifyTokenSocioNegocio,  CarritoCompraController.converterCarShopToCotizacionProyecto);
//OLD CARRITO
export default router;