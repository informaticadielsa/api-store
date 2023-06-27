import routerx from 'express-promise-router';
import proveedoresController from '../controllers/ProveedoresController';
import auth from '../middlewares/auth';

const router = routerx();

//Listado de facturas
router.get('/list', auth.verifyToken, proveedoresController.getListProveedores);

//Crear SN
router.post('/add', auth.verifyToken, proveedoresController.createProveedores);

//Actualizamos  SN
router.put('/update', auth.verifyToken, proveedoresController.updateProveedores);

//Eliminamos una marca
router.delete('/delete', auth.verifyToken, proveedoresController.deleteProveedores);



export default router;