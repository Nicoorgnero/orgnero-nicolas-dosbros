import { Router } from 'express';
import setupController from '../controllers/setupController.js';

const router = Router();

router.get('/estado', setupController.getStatus);
router.post('/administrador', setupController.createAdministrator);

export default router;
