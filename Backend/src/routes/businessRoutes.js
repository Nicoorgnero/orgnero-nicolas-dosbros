import { Router } from 'express';
import businessController from '../controllers/businessController.js';

const router = Router();

router.get('/', businessController.getInfo);

export default router;
