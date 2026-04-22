import { useEffect, useState, type ReactNode } from 'react';
import { MapPin, Calendar, Users, Clock, X } from 'lucide-react';
import { bookingApi, rideApi } from '../lib/api';
import type { Booking, Ride } from '../lib/types';

export default function MyRides() {
  const [offeredRides, setOfferedRides] = useState<Ride[]>([]);
  const [bookedRides, setBookedRides] = useState<Array<Booking & { ride: Ride }>>([]);
  const [bookingsByRide, setBookingsByRide] = useState<Record<string, Booking[]>>({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'offered' | 'booked'>('offered');

  const loadRides = async () => {
    try {
      setLoading(true);
      const [{ rides }, { bookings }] = await Promise.all([rideApi.mine(), bookingApi.mine()]);
      setOfferedRides(rides);
      setBookedRides(bookings);
      const bookingEntries = await Promise.all(rides.map(async (ride) => [ride.id, (await bookingApi.byRide(ride.id)).bookings] as const));
      setBookingsByRide(Object.fromEntries(bookingEntries));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadRides(); }, []);

  const handleCancelRide = async (rideId: string) => {
    if (!confirm('Are you sure you want to cancel this ride?')) return;
    try { await rideApi.cancel(rideId); await loadRides(); } catch (error) { alert(error instanceof Error ? error.message : 'Failed to cancel ride.'); }
  };

  const handleCancelBooking = async (bookingId: string) => {
    if (!confirm('Are you sure you want to cancel this booking?')) return;
    try { await bookingApi.cancel(bookingId); await loadRides(); } catch (error) { alert(error instanceof Error ? error.message : 'Failed to cancel booking.'); }
  };

  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  const formatTime = (dateString: string) => new Date(dateString).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  const getStatusColor = (status: string) => ({ open: 'bg-green-100 text-green-800', full: 'bg-yellow-100 text-yellow-800', completed: 'bg-gray-100 text-gray-800', cancelled: 'bg-red-100 text-red-800', pending: 'bg-blue-100 text-blue-800', accepted: 'bg-green-100 text-green-800', rejected: 'bg-red-100 text-red-800' }[status] || 'bg-gray-100 text-gray-800');

  if (loading) return <div className="flex items-center justify-center h-96"><div className="text-gray-600">Loading your rides...</div></div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="mb-6"><h2 className="text-2xl font-bold text-gray-900">My Rides</h2><p className="text-gray-600 mt-1">Manage your offered and booked rides</p></div>
      <div className="flex gap-2 mb-6">
        <button onClick={() => setActiveTab('offered')} className={`flex-1 py-3 px-4 rounded-lg font-medium transition ${activeTab === 'offered' ? 'bg-[#C41E3A] text-white' : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'}`}>Offered Rides ({offeredRides.length})</button>
        <button onClick={() => setActiveTab('booked')} className={`flex-1 py-3 px-4 rounded-lg font-medium transition ${activeTab === 'booked' ? 'bg-[#C41E3A] text-white' : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'}`}>Booked Rides ({bookedRides.length})</button>
      </div>

      {activeTab === 'offered' ? (
        <div className="space-y-4">{offeredRides.length === 0 ? <Empty title="No offered rides" text="You haven't offered any rides yet." icon={<Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />} /> : offeredRides.map((ride) => <div key={ride.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"><div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4"><div className="flex-1"><div className="flex items-start justify-between mb-3"><div><h3 className="text-lg font-bold text-gray-900 mb-1">{ride.destination}</h3><span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(ride.status)}`}>{ride.status}</span></div></div><div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4"><Info icon={<MapPin className="w-4 h-4 text-[#C41E3A]" />} text={ride.pickup_location} /><Info icon={<Calendar className="w-4 h-4 text-[#7EC8E3]" />} text={formatDate(ride.departure_time)} /><Info icon={<Clock className="w-4 h-4 text-gray-500" />} text={formatTime(ride.departure_time)} /></div>{(bookingsByRide[ride.id]?.length ?? 0) > 0 && <div className="bg-gray-50 rounded-lg p-4"><h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2"><Users className="w-4 h-4" />Passengers ({bookingsByRide[ride.id].length})</h4><div className="space-y-2">{bookingsByRide[ride.id].map((booking) => <div key={booking.id} className="flex items-center justify-between text-sm"><span className="text-gray-700">{booking.rider_name}</span><span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(booking.status)}`}>{booking.status}</span></div>)}</div></div>}</div>{ride.status === 'open' && <button onClick={() => handleCancelRide(ride.id)} className="bg-red-50 text-red-600 px-4 py-2 rounded-lg font-medium hover:bg-red-100 transition flex items-center gap-2 whitespace-nowrap"><X className="w-4 h-4" />Cancel Ride</button>}</div></div>)}</div>
      ) : (
        <div className="space-y-4">{bookedRides.length === 0 ? <Empty title="No booked rides" text="You haven't booked any rides yet." icon={<MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />} /> : bookedRides.map((booking) => <div key={booking.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"><div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4"><div className="flex-1"><div className="flex items-start justify-between mb-3"><div><h3 className="text-lg font-bold text-gray-900 mb-1">{booking.ride.destination}</h3><p className="text-sm text-gray-600">Driver: <span className="font-medium">{booking.ride.driver_name}</span></p></div><span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>{booking.status}</span></div><div className="grid grid-cols-1 md:grid-cols-3 gap-3"><Info icon={<MapPin className="w-4 h-4 text-[#C41E3A]" />} text={booking.ride.pickup_location} /><Info icon={<Calendar className="w-4 h-4 text-[#7EC8E3]" />} text={formatDate(booking.ride.departure_time)} /><Info icon={<Clock className="w-4 h-4 text-gray-500" />} text={formatTime(booking.ride.departure_time)} /></div></div>{booking.status !== 'cancelled' && booking.status !== 'rejected' && booking.ride.status === 'open' && <button onClick={() => handleCancelBooking(booking.id)} className="bg-red-50 text-red-600 px-4 py-2 rounded-lg font-medium hover:bg-red-100 transition flex items-center gap-2 whitespace-nowrap"><X className="w-4 h-4" />Cancel Booking</button>}</div></div>)}</div>
      )}
    </div>
  );
}

function Info({ icon, text }: { icon: ReactNode; text: string }) { return <div className="flex items-center gap-2 text-gray-600"><span>{icon}</span><span className="text-sm">{text}</span></div>; }
function Empty({ title, text, icon }: { title: string; text: string; icon: ReactNode }) { return <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">{icon}<h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3><p className="text-gray-600 mb-4">{text}</p></div>; }
