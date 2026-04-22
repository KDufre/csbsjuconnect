import { Booking } from '../models/Booking.js';
import { Ride } from '../models/Ride.js';

export async function createBooking(req, res) {
  const { rideId } = req.body;
  const ride = await Ride.findById(rideId);
  if (!ride) return res.status(404).json({ message: 'Ride not found' });
  if (String(ride.driver_id) === String(req.user._id)) return res.status(400).json({ message: "You can't book your own ride" });
  if (ride.status !== 'open' || ride.available_seats <= 0) return res.status(400).json({ message: 'Ride is no longer available' });

  const existing = await Booking.findOne({ ride_id: ride._id, rider_id: req.user._id, status: { $in: ['pending', 'accepted'] } });
  if (existing) return res.status(400).json({ message: 'You already have a booking for this ride' });

  const booking = await Booking.create({ ride_id: ride._id, rider_id: req.user._id, rider_name: req.user.name, status: 'accepted' });
  ride.available_seats -= 1;
  ride.status = ride.available_seats > 0 ? 'open' : 'full';
  await ride.save();
  res.status(201).json({ booking: booking.toJSON() });
}

export async function getMyBookings(req, res) {
  const bookings = await Booking.find({ rider_id: req.user._id }).sort({ createdAt: -1 });
  const rideIds = bookings.map((booking) => booking.ride_id);
  const rides = await Ride.find({ _id: { $in: rideIds } });
  const rideMap = new Map(rides.map((ride) => [String(ride._id), ride.toJSON()]));
  res.json({ bookings: bookings.map((booking) => ({ ...booking.toJSON(), ride: rideMap.get(String(booking.ride_id)) })).filter((booking) => booking.ride) });
}

export async function getBookingsForRide(req, res) {
  const ride = await Ride.findById(req.params.rideId);
  if (!ride) return res.status(404).json({ message: 'Ride not found' });
  if (String(ride.driver_id) !== String(req.user._id)) return res.status(403).json({ message: 'Not allowed to view bookings for this ride' });
  const bookings = await Booking.find({ ride_id: ride._id }).sort({ createdAt: -1 });
  res.json({ bookings: bookings.map((booking) => booking.toJSON()) });
}

export async function cancelBooking(req, res) {
  const booking = await Booking.findById(req.params.id);
  if (!booking) return res.status(404).json({ message: 'Booking not found' });
  if (String(booking.rider_id) !== String(req.user._id)) return res.status(403).json({ message: 'Not allowed to cancel this booking' });
  if (booking.status === 'cancelled') return res.json({ booking: booking.toJSON() });

  booking.status = 'cancelled';
  await booking.save();

  const ride = await Ride.findById(booking.ride_id);
  if (ride && ride.status !== 'cancelled') {
    ride.available_seats += 1;
    ride.status = 'open';
    await ride.save();
  }
  res.json({ booking: booking.toJSON() });
}
