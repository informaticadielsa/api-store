import routerx from 'express-promise-router';
import categoriaController from '../controllers/CategoriaController';
import auth from '../middlewares/auth';

const router = routerx();
//Listado y modificadores categorias
router.get('/list', auth.verifyToken, categoriaController.getCategorias);

router.get('/list_public', categoriaController.getCategoriasPublic);

router.get('/getFathers', auth.verifyToken, categoriaController.getCategoriasFather);
router.post('/create_categoria', auth.verifyToken, categoriaController.createCategoria);
router.put('/update_categoria', auth.verifyToken, categoriaController.updateCategoria);
//Modificadores Atributos Categorias
router.post('/add_atribute', auth.verifyToken, categoriaController.createAtributo);
router.put('/update_atribute', auth.verifyToken, categoriaController.updateAtribute);
router.delete('/delete_atribute', auth.verifyToken, categoriaController.deleteAtribute);
export default router;