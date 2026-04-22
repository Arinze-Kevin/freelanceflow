import { Router } from 'express';
import {
  getTimeEntries,
  createTimeEntry,
  updateTimeEntry,
  deleteTimeEntry,
} from '../controllers/timeEntry.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

// Project specific time entry routes
router.get('/projects/:projectId/time-entries', getTimeEntries);
router.post('/projects/:projectId/time-entries', createTimeEntry);

// Individual time entry routes
router.patch('/time-entries/:id', updateTimeEntry);
router.delete('/time-entries/:id', deleteTimeEntry);

export default router;
