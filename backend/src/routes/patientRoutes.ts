import { Router } from 'express';
import { getTodaySchedule, registerPatient } from '../controllers/patientController';


const router = Router();

router.get('/today', getTodaySchedule);
router.post('/register', registerPatient);

export default router;