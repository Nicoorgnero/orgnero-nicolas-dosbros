import { Router } from 'express';
import authController from '../controllers/authController.js';
import { authenticate } from '../middlewares/authenticate.js';

const router = Router();

router.post('/registro', authController.register);
router.post('/login', authController.login);
router.get('/yo', authenticate, authController.me);
router.post('/logout', authenticate, authController.logout);

export default router;
