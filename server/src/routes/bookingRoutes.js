import { Router } from 'express';
import { cancelBooking, createBooking, getBookingsForRide, getMyBookings } from '../controllers/bookingController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();
router.use(protect);
router.post('/', createBooking);
router.get('/mine', getMyBookings);
router.get('/ride/:rideId', getBookingsForRide);
router.patch('/:id/cancel', cancelBooking);
export default router;
