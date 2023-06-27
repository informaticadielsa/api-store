import routerx from 'express-promise-router';
import GerentesController from '../controllers/GerentesController';
import auth from '../middlewares/auth';

const router = routerx();

router.post('/asignar_vendedor_a_gerente', auth.verifyToken, GerentesController.asignarVendedorAGerente);
router.post('/desasignar_vendedor_a_gerente', auth.verifyToken, GerentesController.desasignarVendedorAGerente);


//Esta api tiene funcion en base al vendedor ID de compra finalizadas
router.post('/get_compras_finalizadas_from_vendedores_by_gerentes', auth.verifyToken, GerentesController.getComprasFinalizadasFromVendedoresByGerentes);


//Esta api tiene funcion en base al vendedor ID de compra finalizadas
router.post('/get_compras_finalizadas_from_vendedores_by_gerentes_by_cardcode', auth.verifyToken, GerentesController.getComprasFinalizadasFromVendedoresByGerentesByCardCode);




router.get('/clientes_vendedor_gerentes/:id', auth.verifyToken, GerentesController.sociosNegocioDeVendedorDeGerente);
router.post('/clientes_vendedor_gerentes', auth.verifyToken, GerentesController.sociosNegocioDeVendedorDeGerentePaginada);


export default router;