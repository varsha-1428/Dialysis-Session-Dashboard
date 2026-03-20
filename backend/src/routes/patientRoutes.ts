import { Router } from 'express';
import { getTodaySchedule } from '../controllers/patientController';

const router = Router();

router.get('/today', getTodaySchedule);

export default router;