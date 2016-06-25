import { Router } from 'express';
import apiController from '../controllers/apiController';

const router = new Router();

router.route('/think').get((req, res) => res.send('hi'));
router.route('/think').post(apiController.getFunction);
router.route('/create').post(apiController.createAction);

export default router;
