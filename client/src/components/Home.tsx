import { useEffect, useState, type ReactNode } from 'react';
import { Calendar, MapPin, Users, TrendingUp } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { bookingApi, rideApi } from '../lib/api';

interface Stats {
  totalRides: number;
  upcomingRides: number;
  myBookings: number;
}

export default function Home() {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats>({ totalRides: 0, upcomingRides: 0, myBookings: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const [{ rides }, { bookings }] = await Promise.all([rideApi.list(), bookingApi.mine()]);
        const now = new Date();
        setStats({
          totalRides: rides.filter((r) => r.status === 'open').length,
          upcomingRides: rides.filter((r) => r.status === 'open' && new Date(r.departure_time) >= now).length,
          myBookings: bookings.filter((b) => b.status === 'accepted' || b.status === 'pending').length,
        });
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    if (user) loadStats();
  }, [user]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Welcome back, {user?.name?.split(' ')[0]}!</h2>
        <p className="text-gray-600 mt-1">Find or offer rides within the CSBSJU community</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <StatCard title="Available Rides" value={loading ? '...' : stats.totalRides} icon={<MapPin className="w-6 h-6 text-[#C41E3A]" />} color="bg-red-50" />
        <StatCard title="Upcoming Rides" value={loading ? '...' : stats.upcomingRides} icon={<Calendar className="w-6 h-6 text-[#7EC8E3]" />} color="bg-blue-50" />
        <StatCard title="My Bookings" value={loading ? '...' : stats.myBookings} icon={<Users className="w-6 h-6 text-gray-700" />} color="bg-gray-100" />
      </div>

      <div className="bg-gradient-to-br from-[#C41E3A] to-[#A01828] rounded-lg shadow-lg p-8 text-white">
        <h3 className="text-2xl font-bold mb-2">Start Your Journey</h3>
        <p className="text-red-100 mb-6 max-w-md">Connect with fellow students for safe and convenient ridesharing to Minneapolis, St. Paul, St. Cloud, and beyond.</p>
        <div className="flex flex-wrap gap-3">
          <Tag icon={<TrendingUp className="w-5 h-5" />} text="MERN Backend" />
          <Tag icon={<Users className="w-5 h-5" />} text="Student Community" />
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color }: { title: string; value: string | number; icon: ReactNode; color: string }) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
        </div>
        <div className={`w-12 h-12 ${color} rounded-full flex items-center justify-center`}>{icon}</div>
      </div>
    </div>
  );
}

function Tag({ icon, text }: { icon: ReactNode; text: string }) {
  return <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-lg backdrop-blur-sm">{icon}<span className="text-sm font-medium">{text}</span></div>;
}
