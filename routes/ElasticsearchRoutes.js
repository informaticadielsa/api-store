import routerx from 'express-promise-router';
import almacenesController from '../controllers/ElasticsearchController';
import auth from '../middlewares/auth';

const router = routerx();

router.get('/create_or_update', almacenesController.createOrUpdate);
router.get('/create_or_update_with_library', almacenesController.createOrUpdateWithLibrary);

export default router;