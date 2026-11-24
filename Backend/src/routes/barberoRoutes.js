import { Router } from 'express';
import barberoController from '../controllers/barberoController.js';
import { authenticate, requireRole } from '../middlewares/authenticate.js';

const router = Router();

router.get('/', barberoController.getActive);
router.get('/administracion', authenticate, requireRole('administrador'), barberoController.getAll);
router.post('/', authenticate, requireRole('administrador'), barberoController.create);
router.put('/:id', authenticate, requireRole('administrador'), barberoController.update);
router.delete('/:id', authenticate, requireRole('administrador'), barberoController.deactivate);

export default router;
