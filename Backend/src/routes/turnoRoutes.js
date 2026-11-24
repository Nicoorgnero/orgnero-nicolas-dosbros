import { Router } from 'express';
import turnoController from '../controllers/turnoController.js';
import { authenticate } from '../middlewares/authenticate.js';

const router = Router();

router.use(authenticate);
router.get('/disponibilidad', turnoController.getAvailability);
router.get('/', turnoController.getAll);
router.get('/:id', turnoController.getById);
router.post('/', turnoController.create);
router.put('/:id', turnoController.update);
router.patch('/:id/cancelar', turnoController.cancel);
router.patch('/:id/estado', turnoController.changeStatus);

export default router;
