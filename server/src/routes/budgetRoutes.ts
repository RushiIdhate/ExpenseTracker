import { Router } from 'express';
import { createBudget, getCurrentBudget, getDashboard, getHistory } from '../controllers/budgetController';
import { requireAuth } from '../middleware/auth';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();
router.use(requireAuth);
router.get('/current', asyncHandler(getCurrentBudget));
router.post('/', asyncHandler(createBudget));
router.get('/dashboard', asyncHandler(getDashboard));
router.get('/history', asyncHandler(getHistory));
export default router;
