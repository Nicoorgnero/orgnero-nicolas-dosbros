import { Router } from 'express';
import servicioController from '../controllers/servicioController.js';
import { authenticate, requireRole } from '../middlewares/authenticate.js';

const router = Router();

router.get('/', servicioController.getCatalog);
router.get('/administracion', authenticate, requireRole('administrador'), servicioController.getAll);
router.post('/', authenticate, requireRole('administrador'), servicioController.create);
router.put('/:id', authenticate, requireRole('administrador'), servicioController.update);
router.delete('/:id', authenticate, requireRole('administrador'), servicioController.deactivate);

export default router;
