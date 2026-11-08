import { Router } from 'express';
import requireAuth from '../middleware/auth.js';
import { getProgress, saveProgress } from '../controllers/progressController.js';

const router = Router();
router.use(requireAuth);
router.get('/', getProgress);
router.put('/', saveProgress);
export default router;
