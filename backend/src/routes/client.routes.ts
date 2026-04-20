import { Router } from 'express';
import {
  getClients,
  getClient,
  createClient,
  updateClient,
  deleteClient,
} from '../controllers/client.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

// All client routes are protected
router.use(authenticate);

router.get('/', getClients);
router.get('/:id', getClient);
router.post('/', createClient);
router.patch('/:id', updateClient);
router.delete('/:id', deleteClient);

export default router;
