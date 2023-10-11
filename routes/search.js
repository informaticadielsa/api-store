import routerx from 'express-promise-router';
import SearchController from '../controllers/searchController';
import auth from '../middlewares/auth';
const router = routerx();

//Predecir busqueda
router.post('/prediction', SearchController.searchPrediction);

export default router;