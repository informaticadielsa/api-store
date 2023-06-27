import routerx from 'express-promise-router';
import vendedoresController from '../controllers/VendedoresController';
import auth from '../middlewares/auth';

const router = routerx();


router.post('/desasignar_vendedor', auth.verifyToken, vendedoresController.desasignarVendedorASN);
router.get('/clientes_vendedor/:id', auth.verifyToken, vendedoresController.sociosNegocioDeVendedor);
router.post('/clientes_vendedor', auth.verifyToken, vendedoresController.sociosNegocioDeVendedorPaginada);

router.post('/get_vendedor_compra_finalizada_by_sn', auth.verifyToken, vendedoresController.getVendedorCompraFinalizadaBySN);

//Esta api tiene funcion en base al vendedor ID de compra finalizadas
router.post('/get_vendedor_compra_finalizada_list', auth.verifyToken, vendedoresController.getVendedorCompraFinalizadaList);

//Esta api tiene base de cuanto a los socios de negocios y su codigo de vendedor asignado
router.post('/get_vendedor_compra_finalizada_list_by_cardcode', auth.verifyToken, vendedoresController.getVendedorCompraFinalizadaListByCardCode);

export default router;