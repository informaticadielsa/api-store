import routerx from 'express-promise-router';
import sitemapController from '../controllers/SitemapController';

const router = routerx();
router.get('/create', sitemapController.createSiteMap);

export default router;