import { Router } from 'express';
import { askTutor, getTutorStatus } from '../controllers/tutorController.js';

const router = Router();
router.get('/status', getTutorStatus);
router.post('/', askTutor);
export default router;
