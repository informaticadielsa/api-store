import routerx from 'express-promise-router';
import WishListController from '../controllers/WishListController';
import auth from '../middlewares/auth';

const router = routerx();
// add product to wish list
router.post('/add_producto_to_wish', auth.verifyToken, WishListController.AddProductoToWishList);

// //Actualizamos  marca
// router.put('/update', auth.verifyToken, marcasController.updateMarca);

// //Detalle marca
// router.get('/marca/:id', auth.verifyToken, marcasController.getMarcaById);

// add product to wish list
router.post('/add_producto_to_wish', auth.verifyToken, WishListController.AddProductoToWishList);

//Listado marcas
router.post('/wish_list_by_user', auth.verifyToken, WishListController.GetWishListFromUser);

//Eliminamos un producto de la wish list
router.delete('/delete_producto_from_wish', auth.verifyToken, WishListController.deleteProductoFromWish);




router.post('/add_producto_to_wish_SN_Token', auth.verifyTokenSocioNegocio, WishListController.AddProductoToWishList);
router.post('/get_wish_list_by_user_SN_Token', auth.verifyTokenSocioNegocio, WishListController.GetWishListFromUser);
router.delete('/delete_producto_from_wish_SN_Token', auth.verifyTokenSocioNegocio, WishListController.deleteProductoFromWish);



export default router;