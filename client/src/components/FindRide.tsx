import { useEffect, useMemo, useState } from 'react';
import { MapPin, Calendar, Users, Clock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { bookingApi, rideApi } from '../lib/api';
import type { Ride } from '../lib/types';
import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';

type LatLng = { lat: number; lng: number };
type RideCoords = { pickup: LatLng | null; dest: LatLng | null };

export default function FindRide() {
  const { user } = useAuth();
  const [rides, setRides] = useState<Ride[]>([]);
  const [filteredRides, setFilteredRides] = useState<Ride[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDestination, setSelectedDestination] = useState('all');
  const [bookingRideId, setBookingRideId] = useState<string | null>(null);
  const [mapRideId, setMapRideId] = useState<string | null>(null);
  const [coordsByRideId, setCoordsByRideId] = useState<Record<string, RideCoords>>({});
  const [geocodeLoadingRideId, setGeocodeLoadingRideId] = useState<string | null>(null);
  const [geocodeErrorRideId, setGeocodeErrorRideId] = useState<string | null>(null);

  const destinations = ['all', 'Minneapolis', 'St. Paul', 'St. Cloud', 'Mall of America', 'MSP Airport', 'Collegeville', 'St Joseph'];
  const libraries = useMemo(() => ['places'] as ('places')[], []);
  const { isLoaded } = useJsApiLoader({ googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY, libraries });

  const loadRides = async () => {
    try {
      setLoading(true);
      const { rides } = await rideApi.list();
      const now = new Date();
      const available = rides.filter((ride) => ride.status === 'open' && ride.available_seats > 0 && new Date(ride.departure_time) >= now).sort((a, b) => new Date(a.departure_time).getTime() - new Date(b.departure_time).getTime());
      setRides(available);
      setFilteredRides(available);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadRides(); }, []);
  useEffect(() => {
    setFilteredRides(selectedDestination === 'all' ? rides : rides.filter((ride) => ride.destination.toLowerCase().includes(selectedDestination.toLowerCase())));
  }, [selectedDestination, rides]);

  const handleBookRide = async (rideId: string) => {
    if (!user) return;
    setBookingRideId(rideId);
    try {
      await bookingApi.create(rideId);
      alert('Ride booking request sent.');
      await loadRides();
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to book ride.');
    } finally {
      setBookingRideId(null);
    }
  };

  const geocodeOne = (address: string): Promise<LatLng | null> => new Promise((resolve) => {
    if (!isLoaded || !address?.trim()) return resolve(null);
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ address }, (results, status) => {
      if (status !== 'OK' || !results?.[0]) return resolve(null);
      const loc = results[0].geometry.location;
      resolve({ lat: loc.lat(), lng: loc.lng() });
    });
  });

  const toggleRideMap = async (ride: Ride) => {
    if (!isLoaded) return;
    if (mapRideId === ride.id) return setMapRideId(null);
    setMapRideId(ride.id);
    setGeocodeErrorRideId(null);
    if (coordsByRideId[ride.id]) return;
    setGeocodeLoadingRideId(ride.id);
    try {
      const [pickup, dest] = await Promise.all([geocodeOne(ride.pickup_location), geocodeOne(ride.destination)]);
      if (!pickup && !dest) setGeocodeErrorRideId(ride.id);
      setCoordsByRideId((prev) => ({ ...prev, [ride.id]: { pickup, dest } }));
    } finally {
      setGeocodeLoadingRideId(null);
    }
  };

  const fallbackCenter: LatLng = { lat: 45.5809, lng: -94.3186 };
  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  const formatTime = (dateString: string) => new Date(dateString).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

  if (loading) return <div className="flex items-center justify-center h-96"><div className="text-gray-600">Loading rides...</div></div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="mb-6"><h2 className="text-2xl font-bold text-gray-900">Find a Ride</h2><p className="text-gray-600 mt-1">Browse available rides from fellow students</p></div>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">Filter by Destination</label>
        <div className="flex flex-wrap gap-2">{destinations.map((dest) => <button key={dest} onClick={() => setSelectedDestination(dest)} className={`px-4 py-2 rounded-lg font-medium transition ${selectedDestination === dest ? 'bg-[#C41E3A] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>{dest === 'all' ? 'All Destinations' : dest}</button>)}</div>
      </div>
      {filteredRides.length === 0 ? <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center"><MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" /><h3 className="text-lg font-semibold text-gray-900 mb-2">No rides available</h3><p className="text-gray-600">Try another destination or check back later.</p></div> : <div className="space-y-4">{filteredRides.map((ride) => {
        const coords = coordsByRideId[ride.id];
        const showingMap = mapRideId === ride.id;
        const center = coords?.pickup || coords?.dest || fallbackCenter;
        return <div key={ride.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-start justify-between mb-3"><div><h3 className="text-lg font-bold text-gray-900 mb-1">{ride.destination}</h3><p className="text-sm text-gray-600">Driver: {ride.driver_name}</p></div><span className="text-sm px-3 py-1 rounded-full bg-green-100 text-green-800">{ride.available_seats} seat{ride.available_seats !== 1 ? 's' : ''} left</span></div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4 text-sm text-gray-600">
                <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-[#C41E3A]" />{ride.pickup_location}</div>
                <div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-[#7EC8E3]" />{formatDate(ride.departure_time)}</div>
                <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-gray-500" />{formatTime(ride.departure_time)}</div>
                <div className="flex items-center gap-2"><Users className="w-4 h-4 text-gray-500" />{ride.total_seats} total seats</div>
              </div>
              <div className="flex flex-wrap gap-3">
                <button onClick={() => toggleRideMap(ride)} className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-200">{showingMap ? 'Hide Map' : 'Show Map'}</button>
                <button disabled={bookingRideId === ride.id || ride.driver_id === user?.id} onClick={() => handleBookRide(ride.id)} className="bg-[#C41E3A] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#A01828] disabled:opacity-50">{ride.driver_id === user?.id ? 'Your Ride' : bookingRideId === ride.id ? 'Booking...' : 'Book Ride'}</button>
              </div>
              {showingMap && <div className="mt-4">{geocodeLoadingRideId === ride.id ? <div className="text-sm text-gray-500">Loading map...</div> : geocodeErrorRideId === ride.id ? <div className="text-sm text-red-600">Could not load this map.</div> : isLoaded && <div className="rounded-lg overflow-hidden border border-gray-200"><GoogleMap mapContainerStyle={{ width: '100%', height: '260px' }} center={center} zoom={8}>{coords?.pickup && <Marker position={coords.pickup} label="P" />}{coords?.dest && <Marker position={coords.dest} label="D" />}</GoogleMap></div>}</div>}
            </div>
          </div>
        </div>;})}</div>}
    </div>
  );
}
