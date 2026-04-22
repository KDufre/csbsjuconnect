import { Ride } from '../models/Ride.js';

export async function listRides(req, res) {
  const rides = await Ride.find().sort({ departure_time: 1 });
  res.json({ rides: rides.map((ride) => ride.toJSON()) });
}

export async function createRide(req, res) {
  const { destination, pickup_location, departure_time, total_seats } = req.body;
  if (!destination || !pickup_location || !departure_time || !total_seats) {
    return res.status(400).json({ message: 'Missing required ride fields' });
  }
  const seats = Number(total_seats);
  const ride = await Ride.create({
    driver_id: req.user._id,
    driver_name: req.user.name,
    destination,
    pickup_location,
    departure_time,
    total_seats: seats,
    available_seats: seats,
    status: seats > 0 ? 'open' : 'full',
  });
  res.status(201).json({ ride: ride.toJSON() });
}

export async function getMyRides(req, res) {
  const rides = await Ride.find({ driver_id: req.user._id }).sort({ departure_time: 1 });
  res.json({ rides: rides.map((ride) => ride.toJSON()) });
}

export async function cancelRide(req, res) {
  const ride = await Ride.findById(req.params.id);
  if (!ride) return res.status(404).json({ message: 'Ride not found' });
  if (String(ride.driver_id) !== String(req.user._id)) {
    return res.status(403).json({ message: 'Not allowed to cancel this ride' });
  }
  ride.status = 'cancelled';
  await ride.save();
  res.json({ ride: ride.toJSON() });
}
