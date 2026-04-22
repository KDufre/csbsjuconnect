import dotenv from 'dotenv';
import { connectDB } from '../config/db.js';
import { User } from '../models/User.js';
import { Ride } from '../models/Ride.js';
import bcrypt from 'bcryptjs';

dotenv.config();

const demoDrivers = [
  { email: 'sarah@csbsju.edu', name: 'Sarah Johnson' },
  { email: 'mike@csbsju.edu', name: 'Mike Chen' },
  { email: 'emily@csb.edu', name: 'Emily Rodriguez' },
  { email: 'alex@csbsju.edu', name: 'Alex Thompson' },
  { email: 'jordan@csb.edu', name: 'Jordan Kim' },
];

const destinations = [
  { dest: 'Minneapolis, MN, USA', pickup: '2850 Abbey Plaza, Collegeville, MN 56321, USA' },
  { dest: 'St Paul, MN, USA', pickup: '37 South College Ave S, St Joseph, MN 56374, USA' },
  { dest: 'St Cloud, MN, USA', pickup: '60 E Broadway, Bloomington, MN 55425, USA' },
  { dest: 'MSP Airport', pickup: '2850 Abbey Plaza, Collegeville, MN 56321, USA' },
];

await connectDB();
await Ride.deleteMany({});

for (let i = 0; i < demoDrivers.length; i++) {
  let user = await User.findOne({ email: demoDrivers[i].email });
  if (!user) user = await User.create({ ...demoDrivers[i], passwordHash: await bcrypt.hash('password123', 10) });
  const now = new Date();
  now.setDate(now.getDate() + i + 1);
  now.setHours(9 + i, 0, 0, 0);
  const total = 3 + (i % 2);
  await Ride.create({
    driver_id: user._id,
    driver_name: user.name,
    destination: destinations[i % destinations.length].dest,
    pickup_location: destinations[i % destinations.length].pickup,
    departure_time: now,
    total_seats: total,
    available_seats: total,
    status: 'open',
  });
}

console.log('Demo data seeded');
process.exit(0);
