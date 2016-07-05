import { Router } from 'express';
import apiController from '../controllers/apiController';

const router = new Router();

router.route('/think').get((req, res) => res.send('hi im the brain'));
router.route('/think').post(apiController.getFunction);
router.route('/create').post(apiController.createAction);
router.route('/nodes').post(apiController.allNodeTypes);
router.route('/learn').post(apiController.supervisedLearning);

export default router;
