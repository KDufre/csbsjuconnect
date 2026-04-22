export interface User {
  id: string;
  email: string;
  name: string;
  created_at: string;
}

export interface Ride {
  id: string;
  driver_id: string;
  driver_name: string;
  destination: string;
  pickup_location: string;
  departure_time: string;
  total_seats: number;
  available_seats: number;
  status: 'open' | 'full' | 'completed' | 'cancelled';
  created_at: string;
}

export interface Booking {
  id: string;
  ride_id: string;
  rider_id: string;
  rider_name: string;
  status: 'pending' | 'accepted' | 'rejected' | 'cancelled';
  created_at: string;
}
