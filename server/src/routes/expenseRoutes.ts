import { Router } from 'express';
import { createExpense, deleteExpense, listExpenses } from '../controllers/expenseController';
import { requireAuth } from '../middleware/auth';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();
router.use(requireAuth);
router.get('/', asyncHandler(listExpenses));
router.post('/', asyncHandler(createExpense));
router.delete('/:id', asyncHandler(deleteExpense));
export default router;
