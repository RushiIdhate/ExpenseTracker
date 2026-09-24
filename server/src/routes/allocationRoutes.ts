import { Router } from 'express';
import { getAllocation, saveAllocation } from '../controllers/allocationController';
import { requireAuth } from '../middleware/auth';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();
router.use(requireAuth);
router.get('/', asyncHandler(getAllocation));
router.put('/', asyncHandler(saveAllocation));
export default router;
