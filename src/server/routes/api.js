import { Router } from 'express';
// import apiController from '../controllers/apiController';

const router = new Router();

router.route('/think').get((req, res) => res.send('Hi'));

export default router;