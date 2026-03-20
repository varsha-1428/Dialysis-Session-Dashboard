import { Router } from 'express';
import { getTodaySchedule, registerPatient } from '../controllers/patientController';
import { completeSession, startSession, updateSessionNotes } from '../controllers/sessionController';


const router = Router();

router.get('/today', getTodaySchedule);
router.post('/register', registerPatient);
router.post('/sessions/start', startSession);
router.post('/sessions/complete', completeSession);
router.patch('/sessions/:sessionId/notes', updateSessionNotes);

export default router;