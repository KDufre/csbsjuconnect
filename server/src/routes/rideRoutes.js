import { Router } from 'express';
import { cancelRide, createRide, getMyRides, listRides } from '../controllers/rideController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();
router.get('/', listRides);
router.get('/mine', protect, getMyRides);
router.post('/', protect, createRide);
router.patch('/:id/cancel', protect, cancelRide);
export default router;
