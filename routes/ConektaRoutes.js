import routerx from 'express-promise-router';
// import WishListController from '../controllers/WishListController';
import ConektaController from '../controllers/ConektaController';
import auth from '../middlewares/auth';


const router = routerx();


// add product to wish list
router.get('/conektaTesting', ConektaController.conektaTesting);



//Obtener la public key para front
router.get('/conekta_public_key', ConektaController.getConektaPublicKey);
router.get('/conekta_private_key', auth.verifyToken, ConektaController.getConektaPrivateKey);


//Crear orden significa hacer un pago en conekta
router.post('/conektaCrearOrden', auth.verifyTokenSocioNegocio, ConektaController.conektaCrearOrden);
router.post('/conektaDevolucion', auth.verifyToken, ConektaController.conektaDevoluciones);
router.get('/GetConektaDevolucion/:id', auth.verifyToken, ConektaController.conektaGetDevoluciones);


router.put('/conekta_update_public_key', auth.verifyToken, ConektaController.updatePublicKey);
router.put('/conekta_update_private_key', auth.verifyToken, ConektaController.updatePrivateKey);


export default router;